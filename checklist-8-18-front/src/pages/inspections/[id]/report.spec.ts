import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import ReportPage from './report.vue'; // Ajuste o caminho para o seu componente

// --- MOCKS ---
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};
vi.mock('vue-router/auto', () => ({
  useRoute: vi.fn(() => ({ params: { id: '123' } })),
  useRouter: vi.fn(() => mockRouter),
}));
const vuetify = createVuetify();

// --- INÍCIO DA SUÍTE DE TESTES ---
describe('Tela 5: Relatório da Inspeção (report.vue)', () => {

  // Função auxiliar para montar o componente com estado inicial
  const mountComponent = (initialState = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        inspections: {
          // Estado mínimo para evitar erros
          currentInspection: null,
          currentReportHtml: null,
          ...initialState,
        },
      },
    });
    const store = useInspectionsStore(pinia);
    const wrapper = mount(ReportPage, {
      global: { plugins: [vuetify, pinia] },
    });
    return { wrapper, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar as actions para buscar dados da inspeção e o HTML do relatório ao ser montado', () => {
    const { store } = mountComponent();

    // Verificamos se ambas as actions foram chamadas no hook onMounted
    expect(store.fetchInspectionById).toHaveBeenCalledWith(123);
    expect(store.fetchReportHtml).toHaveBeenCalledWith(123);
  });

  it('deve exibir os dados do cabeçalho (status, inspetor, motorista) corretamente', async () => {
    const { wrapper, store } = mountComponent();

    // Simulamos o estado da store após o carregamento dos dados
    store.isLoading = false;
    store.currentInspection = {
      id: 123,
      inspectorName: 'Leonardo E2E',
      driverName: 'Motorista E2E',
      items: [{ statusId: 2 }] // Aprovado
    } as any;

    await wrapper.vm.$nextTick(); // Esperamos o Vue re-renderizar

    // Verificamos se os dados estão na tela
    expect(wrapper.find('[data-testid="inspector-name"]').text()).toBe('Leonardo E2E');
    expect(wrapper.find('[data-testid="driver-name"]').text()).toBe('Motorista E2E');
    expect(wrapper.find('.v-chip').text()).toContain('Resultado: APROVADO');
  });

  it('deve renderizar o iframe com o HTML do relatório quando disponível', async () => {
    const { wrapper, store } = mountComponent();

    store.isLoading = false;
    store.currentInspection = { id: 123 } as any; // Dados mínimos para o v-if passar
    store.currentReportHtml = '<h1>Meu Relatório em HTML</h1>'; // HTML mockado

    await wrapper.vm.$nextTick();

    const iframe = wrapper.find('[data-testid="report-iframe"]');
    expect(iframe.exists()).toBe(true);
    // Verificamos se o atributo srcdoc contém o nosso HTML
    expect(iframe.attributes('srcdoc')).toBe('<h1>Meu Relatório em HTML</h1>');

    // Garante que o alerta de erro não está sendo exibido
    expect(wrapper.find('[data-testid="html-error-alert"]').exists()).toBe(false);
  });

  it('deve exibir um alerta de erro se o HTML do relatório não for carregado', async () => {
    const { wrapper, store } = mountComponent();

    store.isLoading = false;
    store.currentInspection = { id: 123 } as any;
    store.currentReportHtml = null; // Simulamos que o HTML não foi carregado

    await wrapper.vm.$nextTick();

    // O iframe não deve existir
    expect(wrapper.find('[data-testid="report-iframe"]').exists()).toBe(false);
    // O alerta de erro deve estar visível
    expect(wrapper.find('[data-testid="html-error-alert"]').exists()).toBe(true);
  });

  it('deve chamar a action "downloadReportPdf" ao clicar no botão de baixar', async () => {
    const { wrapper, store } = mountComponent();
    store.isLoading = false;
    store.currentInspection = { id: 123 } as any;

    await wrapper.vm.$nextTick();

    // Clica no botão de download
    await wrapper.find('[data-testid="download-pdf-btn"]').trigger('click');

    // Verifica se a action correta da store foi chamada
    expect(store.downloadReportPdf).toHaveBeenCalledWith(123);
  });

  it('deve chamar a função de impressão ao clicar no botão de imprimir', async () => {
    const { wrapper, store } = mountComponent();
    store.isLoading = false;
    store.currentInspection = { id: 123 } as any;
    store.currentReportHtml = '<html><body>Relatório</body></html>';

    await wrapper.vm.$nextTick();

    // 1. espiamos a função 'print' do 'window' global.
    //    Isso funciona porque a impressão do iframe acaba chamando a função do navegador.
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => { });

    // 2. Simulamos que o 'reportFrame.value' existe, para a guarda 'if (iframe)' passar.
    wrapper.vm.reportFrame = { contentWindow: window } as any;

    // 3. Clica no botão de imprimir
    await wrapper.find('[data-testid="print-btn"]').trigger('click');

    // 4. Verificamos se o nosso espião (spy) global foi chamado
    expect(printSpy).toHaveBeenCalledTimes(1);

    // 5. Boa prática: remove o espião após o teste
    printSpy.mockRestore();
  });
});