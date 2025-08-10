import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import NewInspectionPage from './new.vue';
import type { Lookup } from '@/models';

// Mock do vue-router
const mockRouter = {
  push: vi.fn(),
};
vi.mock('vue-router/auto', () => ({
  useRouter: () => mockRouter,
}));

const vuetify = createVuetify();

describe('Tela 2: Nova Inspeção (new.vue)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve chamar a action fetchFormLookups ao ser montado', () => {
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const inspectionsStore = useInspectionsStore(pinia);
    mount(NewInspectionPage, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    expect(inspectionsStore.fetchFormLookups).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar o formulário ao preencher um campo de texto', async () => {
    const wrapper = mount(NewInspectionPage, {
      global: {
        plugins: [vuetify, createTestingPinia({ createSpy: vi.fn })],
      },
    });
    const inspectorInput = wrapper.find('[data-testid="inspector-name-input"]').find('input');
    await inspectorInput.setValue('Leonardo Adler');
    expect((wrapper.vm as any).form.inspectorName).toBe('Leonardo Adler');
  });

  it('deve chamar a action createInspection quando o formulário for válido', async () => {
    // Arrange
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const inspectionsStore = useInspectionsStore(pinia);
    const mockNewInspection = { id: 999 };
    vi.mocked(inspectionsStore.createInspection).mockResolvedValue(mockNewInspection as any);

    const wrapper = mount(NewInspectionPage, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    
    // Simulamos que a validação do Vuetify, quando chamada, retornará 'true'
    const formRefMock = {
      validate: vi.fn().mockResolvedValue({ valid: true }),
    };
    (wrapper.vm as any).formRef = formRefMock;
    
    // Act
    const submitButton = wrapper.find('[data-testid="submit-btn"]');
    await submitButton.trigger('click');

    // Assert
    expect(formRefMock.validate).toHaveBeenCalledTimes(1);
    expect(inspectionsStore.createInspection).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/inspections/999');
  });

  it('NÃO deve chamar a action createInspection se o formulário for inválido', async () => {
    // Arrange
    const pinia = createTestingPinia({ createSpy: vi.fn });
    const inspectionsStore = useInspectionsStore(pinia);
    
    const wrapper = mount(NewInspectionPage, {
      global: {
        plugins: [vuetify, pinia],
      },
    });
    
    // Simulamos que a validação do Vuetify, quando chamada, retornará 'false'
    const formRefMock = {
      validate: vi.fn().mockResolvedValue({ valid: false }),
    };
    (wrapper.vm as any).formRef = formRefMock;

    // Act
    const submitButton = wrapper.find('[data-testid="submit-btn"]');
    await submitButton.trigger('click');
    
    // Assert
    expect(formRefMock.validate).toHaveBeenCalledTimes(1);
    expect(inspectionsStore.createInspection).not.toHaveBeenCalled();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});