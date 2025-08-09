import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { VForm } from 'vuetify/components'; // Importamos o VForm para encontrá-lo
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import FinalizePage from './finalize.vue';

// Mocks
const mockRouter = {
  push: vi.fn(),
  back: vi.fn(),
};
vi.mock('vue-router/auto', () => ({
  useRoute: vi.fn(() => ({ params: { id: '123' } })),
  useRouter: vi.fn(() => mockRouter),
}));
const vuetify = createVuetify();
window.alert = vi.fn();

describe('Tela 4: Revisar e Finalizar Inspeção', () => {

  const mountComponent = (initialState = {}) => {
    const pinia = createTestingPinia({
      createSpy: vi.fn,
      initialState: {
        inspections: {
          currentInspection: { id: 123, items: [], inspectorName: 'Inspetor Inicial' },
          ...initialState,
        },
      },
    });
    const store = useInspectionsStore(pinia);
    store.updateInspection = vi.fn().mockResolvedValue({});
    const wrapper = mount(FinalizePage, {
      global: { plugins: [vuetify, pinia] },
    });
    return { wrapper, store };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar os dados e exibir o formulário em modo somente leitura', async () => {
    const { wrapper } = mountComponent();
    await wrapper.vm.$nextTick();
    
    const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]');
    expect(inspectorInput.find('input').attributes('readonly')).toBeDefined();
  });

  describe('Fluxo de Edição', () => {
    it('deve habilitar os campos do formulário ao clicar em "Liberar Edição"', async () => {
      const { wrapper } = mountComponent();
      await wrapper.vm.$nextTick();
      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      
      const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]');
      expect(inspectorInput.find('input').attributes('readonly')).toBeUndefined();
    });

    it('deve chamar a action "updateInspection" ao salvar as alterações', async () => {
      const { wrapper, store } = mountComponent();
      await wrapper.vm.$nextTick();
      
      // Encontramos o componente VForm e mockamos seu método 'validate'.
      const formComponent = wrapper.findComponent(VForm);
      vi.spyOn(formComponent.vm, 'validate').mockResolvedValue({ valid: true });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      
      const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]');
      await inspectorInput.find('input').setValue('Novo Nome do Inspetor');

      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      
      expect(store.updateInspection).toHaveBeenCalledTimes(1);
    });

    it('deve bloquear os campos novamente após salvar', async () => {
      const { wrapper } = mountComponent();
      await wrapper.vm.$nextTick();

      // Também mockamos a validação aqui para permitir que a função 'saveChanges' complete.
      const formComponent = wrapper.findComponent(VForm);
      vi.spyOn(formComponent.vm, 'validate').mockResolvedValue({ valid: true });

      await wrapper.find('[data-testid="edit-btn"]').trigger('click');
      await wrapper.find('[data-testid="save-btn"]').trigger('click');
      await wrapper.vm.$nextTick();
      
      expect(wrapper.find('[data-testid="edit-btn"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="save-btn"]').exists()).toBe(false);
    });
  });

  describe('Fluxo de Finalização', () => {
    it('deve chamar a action "finalizeInspection" e redirecionar em caso de sucesso', async () => {
        const { wrapper, store } = mountComponent();
        await wrapper.vm.$nextTick();
        await wrapper.find('[data-testid="submit-finalize-btn"]').trigger('click');
        expect(store.finalizeInspection).toHaveBeenCalledWith(123);
        expect(mockRouter.push).toHaveBeenCalledWith('/inspections/123/report');
    });

    it('deve ter o botão de finalizar DESABILITADO enquanto estiver no modo de edição', async () => {
        const { wrapper } = mountComponent();
        await wrapper.vm.$nextTick();
        await wrapper.find('[data-testid="edit-btn"]').trigger('click');
        const finalizeButton = wrapper.find('[data-testid="submit-finalize-btn"]');
        expect(finalizeButton.attributes('disabled')).toBeDefined();
    });
  });
});