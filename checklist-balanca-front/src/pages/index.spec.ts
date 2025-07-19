import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import IndexPage from './index.vue';
import type { Inspection } from '@/models/inspection.model';

const mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
}));

const vuetify = createVuetify();

describe('Tela Inicial (index.vue)', () => {
  
  beforeEach(() => {
    vi.clearAllMocks();
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
      global: {
        plugins: [vuetify, pinia],
      },
    });
    
    expect(inspectionsStore.fetchInspections).toHaveBeenCalledTimes(1);
  });
  
  it('deve exibir os dados da inspeção na tabela quando disponíveis', async () => {
    const mockInspection: Inspection = {
      id: 123,
      createdAt: new Date().toISOString(),
      status: { id: 1, name: 'EM_INSPECAO' },
      inspectorName: 'Leonardo Teste',
      driverName: 'Motorista Teste',
    };

    const wrapper = mount(IndexPage, {
      global: {
        plugins: [
          vuetify,
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              inspections: {
                inspections: [mockInspection],
              },
            },
          }),
        ],
      },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain('123');
    expect(wrapper.text()).toContain('Leonardo Teste');
    expect(wrapper.text()).toContain('EM_INSPECAO');
  });

  it('deve chamar router.push com o ID correto ao clicar em Continuar', async () => {
    // Arrange
    const mockInspection: Inspection = {
      id: 456,
    } as Inspection; // O mock pode ser parcial para este teste

    const wrapper = mount(IndexPage, {
      global: {
        plugins: [vuetify, createTestingPinia({
          createSpy: vi.fn,
          initialState: { inspections: { inspections: [mockInspection] } },
        })],
      },
    });
    
    await wrapper.vm.$nextTick();

    // ✅ CORREÇÃO 2: Usamos o data-testid para encontrar o botão exato
    const continueButton = wrapper.find('[data-testid="continue-btn-456"]');
    await continueButton.trigger('click');

    // Assert
    expect(mockRouter.push).toHaveBeenCalledWith('/inspections/456');
  });
});