import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia, type TestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import ChecklistPage from './[id].vue';
import type { Inspection } from '@/models';

// MOCKS E CONFIGURAÇÃO INICIAL (sem alterações)
vi.mock('vue-router/auto', () => ({
  useRoute: () => ({ params: { id: '123' } }),
  useRouter: () => ({ push: vi.fn() }),
}));

const vuetify = createVuetify();

const getMockInspection = (): Inspection => ({
  id: 123,
  items: Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    masterPointId: i + 1,
    statusId: 1, // Status inicial "Pendente", inválido para salvar
    observations: '',
    evidences: [],
    masterPoint: {
      pointNumber: i + 1,
      name: `Ponto ${i + 1}`,
      description: `Descrição ${i + 1}`,
    },
  })),
});

// Stubs para componentes Vuetify
const vuetifyStubs = {
  VCard: { template: '<div class="v-card"><slot /></div>' },
  VBtn: { template: '<button @click="$emit(\'click\')"><slot /></button>', props: ['value'] },
  VOverlay: { template: '<div v-if="modelValue"><slot /></div>', props: ['modelValue'] },
  VTextarea: {
    template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)"></textarea>',
    props: ['modelValue'],
  },
  VFileInput: {
    template: '<input type="file" />',
    props: ['modelValue'],
  },
  VBtnToggle: {
    template: `
      <div class="v-btn-toggle">
        <button @click="$emit('update:modelValue', 2)" data-testid="status-btn-2">Conforme</button>
        <button @click="$emit('update:modelValue', 3)" data-testid="status-btn-3">Não Conforme</button>
        <button @click="$emit('update:modelValue', 4)" data-testid="status-btn-4">N/A</button>
      </div>
    `,
    props: ['modelValue'],
  },
};

// --- INÍCIO DA SUÍTE DE TESTES REATORADA ---

describe('Tela 3: Checklist (inspections/[id].vue)', () => {
  let pinia: TestingPinia;

  beforeEach(() => {
    // Criamos uma nova instância do Pinia para cada teste garantir isolamento
    pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    
    // Mock do visualViewport
    global.visualViewport = { addEventListener: vi.fn(), removeEventListener: vi.fn() } as any;
  });

  afterEach(() => {
    delete (global as any).visualViewport;
    vi.clearAllMocks();
  });

  // =================================================================
  // == 1. Testes de Comportamento Inicial (Ao Montar)
  // =================================================================
  describe('1. Comportamento Inicial', () => {
    it('busca a inspeção correta pelo ID da rota ao montar', async () => {
      const store = useInspectionsStore(pinia);
      store.fetchInspectionById = vi.fn();

      mount(ChecklistPage, { global: { plugins: [vuetify, pinia], stubs: vuetifyStubs } });

      expect(store.fetchInspectionById).toHaveBeenCalledWith(123);
    });

    it('exibe o loader enquanto a inspeção está a ser carregada', () => {
      const store = useInspectionsStore(pinia);
      store.isLoading = true; // Força o estado de loading

      const wrapper = mount(ChecklistPage, { global: { plugins: [vuetify, pinia], stubs: vuetifyStubs } });
      
      expect(wrapper.find('.v-progress-circular').exists()).toBe(true);
    });

    it('seleciona o primeiro ponto da lista por padrão após o carregamento', async () => {
      const store = useInspectionsStore(pinia);
      // Simula a API a retornar a inspeção
      store.currentInspection = getMockInspection();

      const wrapper = mount(ChecklistPage, { global: { plugins: [vuetify, pinia], stubs: vuetifyStubs } });
      await flushPromises(); 

      expect(wrapper.vm.selectedPoint.id).toBe(1);
    });
  });

  // =================================================================
  // == 2. Testes para Ações de Salvamento Explícito
  // =================================================================
  describe('2. Ações de Salvamento Explícito', () => {
    it('salva status e observações ao clicar no botão "Salvar Alterações"', async () => {
      const store = useInspectionsStore(pinia);
      store.currentInspection = getMockInspection();
      const updateSpy = vi.spyOn(store, 'updateChecklistItem').mockResolvedValue({} as any);

      const wrapper = mount(ChecklistPage, { 
        global: { plugins: [vuetify, pinia], stubs: vuetifyStubs },
        // Adicionamos um data-testid ao botão de salvar para um seletor robusto
        slots: { default: '<v-btn data-testid="save-btn">Salvar Alterações</v-btn>' }
      });
      await flushPromises();
      
      // Simula a ação do utilizador
      wrapper.vm.selectedPoint.statusId = 3; // "Não Conforme"
      await wrapper.find('textarea').setValue('Teste de observação');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      expect(updateSpy).toHaveBeenCalledTimes(1);
      expect(updateSpy).toHaveBeenCalledWith(1, {
        statusId: 3,
        observations: 'Teste de observação',
      });
    });

    it('salva status e envia evidência ao mudar o status', async () => {
      const store = useInspectionsStore(pinia);
      store.currentInspection = getMockInspection();
      const updateSpy = vi.spyOn(store, 'updateChecklistItem').mockResolvedValue({} as any);
      const uploadSpy = vi.spyOn(store, 'uploadEvidence').mockResolvedValue({} as any);

      const mockFile = new File(['evidence'], 'evidence.png', { type: 'image/png' });

      const wrapper = mount(ChecklistPage, { global: { plugins: [vuetify, pinia], stubs: vuetifyStubs } });
      await flushPromises();

      // Simula a ação do utilizador
      wrapper.vm.stagedFile = [mockFile]; // Prepara um ficheiro
      await wrapper.find('[data-testid="status-btn-2"]').trigger('click'); // Clica em "Conforme"

      // Verifica se AMBAS as actions foram chamadas na ordem correta
      expect(updateSpy).toHaveBeenCalledOnce();
      expect(uploadSpy).toHaveBeenCalledOnce();
      expect(uploadSpy).toHaveBeenCalledWith(1, mockFile);
    });
  });

  // =================================================================
  // == 3. Testes de Navegação e Descarte de Alterações
  // =================================================================
  describe('3. Navegação e Descarte de Alterações', () => {
    it('descarta alterações não salvas (rascunho) ao selecionar outro ponto', async () => {
      const store = useInspectionsStore(pinia);
      store.currentInspection = getMockInspection();
      const updateSpy = vi.spyOn(store, 'updateChecklistItem');
      const uploadSpy = vi.spyOn(store, 'uploadEvidence');

      const wrapper = mount(ChecklistPage, { global: { plugins: [vuetify, pinia], stubs: vuetifyStubs } });
      await flushPromises();

      // 1. Utilizador faz alterações no Ponto 1 (sem salvar)
      await wrapper.find('textarea').setValue('Isto não deve ser salvo');
      wrapper.vm.stagedFile = [new File([], 'test.png')];

      // 2. Utilizador clica no Ponto 2
      await wrapper.find('[data-testid="item-2"]').trigger('click');

      // 3. Verifica se NENHUMA ação de salvamento foi chamada
      expect(updateSpy).not.toHaveBeenCalled();
      expect(uploadSpy).not.toHaveBeenCalled();

      // 4. Verifica se o rascunho de ficheiro foi limpo
      expect(wrapper.vm.stagedFile).toEqual([]);
      // 5. Verifica se a navegação foi bem-sucedida
      expect(wrapper.vm.selectedPoint.id).toBe(2);
    });
  });

  // =================================================================
  // == 4. Testes de Validações e Casos de Borda
  // =================================================================
  describe('4. Validações e Casos de Borda', () => {
    it('não salva e exibe alerta se nenhum status válido for selecionado', async () => {
      const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
      
      const store = useInspectionsStore(pinia);
      store.currentInspection = getMockInspection();
      // O status inicial já é 1 (inválido)
      
      const updateSpy = vi.spyOn(store, 'updateChecklistItem');

      const wrapper = mount(ChecklistPage, { 
        global: { plugins: [vuetify, pinia], stubs: vuetifyStubs },
        slots: { default: '<v-btn data-testid="save-btn">Salvar Alterações</v-btn>' }
      });
      await flushPromises();

      await wrapper.find('[data-testid="save-btn"]').trigger('click');

      expect(updateSpy).not.toHaveBeenCalled();
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('selecione um Status'));

      alertSpy.mockRestore(); // Limpa o spy
    });
  });
});