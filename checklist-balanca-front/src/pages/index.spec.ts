import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import IndexPage from './index.vue';
import type { Inspection } from '@/models/inspection.model';
import { useDisplay } from 'vuetify';

const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

// Mock do useDisplay para controlar a vista (mobile vs. desktop)
vi.mock('vuetify', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vuetify')>();
  return {
    ...actual,
    useDisplay: vi.fn(() => ({ mobile: false })), // Por padrão, simula desktop
  };
});

const vuetify = createVuetify();

describe('Tela Inicial (index.vue)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useDisplay as vi.Mock).mockReturnValue({ mobile: false }); // Reset para desktop
  });

  it('deve renderizar os títulos e o botão principal corretamente', () => {
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [vuetify, createTestingPinia({ createSpy: vi.fn })],
      },
    });

    expect(wrapper.text()).toContain('Bem-vindo, Inspetor');
    expect(wrapper.text()).toContain('Iniciar Novo Checklist 8/18');
    expect(wrapper.text()).toContain('Inspeções Salvas');
  });

  it('deve chamar a action fetchInspections ao ser montado', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const inspectionsStore = useInspectionsStore(pinia);

    mount(IndexPage, {
      global: { plugins: [vuetify, pinia] },
    });
    
    expect(inspectionsStore.fetchInspections).toHaveBeenCalledTimes(1);
  });
  
  it('deve exibir os dados da inspeção na tabela (desktop)', async () => {
    const mockInspection: Inspection = {
      id: 123,
      createdAt: new Date().toISOString(),
      status: { id: 1, name: 'EM_INSPECAO' },
      inspectorName: 'Leonardo Teste',
      driverName: 'Motorista Teste',
    } as any;

    const wrapper = mount(IndexPage, {
      global: {
        plugins: [vuetify, createTestingPinia({
          initialState: { inspections: { inspections: [mockInspection] } },
        })],
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.find('table').exists()).toBe(true);
    expect(wrapper.text()).toContain('Leonardo Teste');
    expect(wrapper.text()).toContain('EM_INSPECAO');
  });

  it('deve exibir os dados da inspeção em cartões (mobile)', async () => {
    (useDisplay as vi.Mock).mockReturnValue({ mobile: true }); // Simula vista de telemóvel

    const mockInspection: Inspection = {
      id: 123,
      createdAt: new Date().toISOString(),
      status: { id: 1, name: 'EM_INSPECAO' },
      inspectorName: 'Leonardo Teste',
      driverName: 'Motorista Teste',
    } as any;
  
    const wrapper = mount(IndexPage, {
      global: {
        plugins: [vuetify, createTestingPinia({
          initialState: { inspections: { inspections: [mockInspection] } },
        })],
      },
    });
  
    await wrapper.vm.$nextTick();
    expect(wrapper.find('table').exists()).toBe(false); // A tabela não deve existir
    expect(wrapper.find('.v-card-title').text()).toContain('#123');
    expect(wrapper.text()).toContain('Leonardo Teste');
  });

  it('deve chamar router.push com o ID correto ao clicar em Continuar', async () => {
    // CORREÇÃO: Fornecer um mock completo para evitar erros de renderização
    const mockInspection: Inspection = {
      id: 456,
      createdAt: new Date().toISOString(),
      status: { id: 1, name: 'EM_INSPECAO' },
      inspectorName: 'Inspetor',
      driverName: 'Motorista',
    } as any;

    const wrapper = mount(IndexPage, {
      global: {
        plugins: [vuetify, createTestingPinia({
          initialState: { inspections: { inspections: [mockInspection] } },
        })],
      },
    });
    
    await wrapper.vm.$nextTick();
    
    const continueButton = wrapper.find('[data-testid="continue-btn-456"]');
    await continueButton.trigger('click');

    expect(mockRouter.push).toHaveBeenCalledWith('/inspections/456');
  });
});