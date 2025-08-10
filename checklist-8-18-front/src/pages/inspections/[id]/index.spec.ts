import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, flushPromises, VueWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import { createTestingPinia } from '@pinia/testing';
import { useInspectionsStore } from '@/stores/inspections';
import ChecklistPage from './index.vue';
import type { Inspection, ItemEvidence } from '@/models';

// --- MOCKS GLOBAIS ---
const mockRouter = { push: vi.fn() };
vi.mock('vue-router/auto', () => ({
  useRoute: () => ({ params: { id: '123' } }),
  useRouter: () => mockRouter,
}));

const vuetify = createVuetify();

// --- DADOS MOCKADOS ---
const getMockInspection = (isComplete = false): Inspection => ({
  id: 123,
  items: Array.from({ length: 18 }, (_, i) => ({
    id: i + 1,
    masterPointId: i + 1,
    statusId: isComplete ? 2 : i === 0 ? 1 : 2, // Primeiro item pendente por padrão
    observations: '',
    evidences: i === 0 ? [{
      id: 1,
      fileName: 'test.png',
      filePath: 'path/test.png',
      inspectionId: 123,
      pointNumber: i + 1
    }] : [],
    masterPoint: { pointNumber: i + 1, name: `Ponto ${i + 1}`, description: `Descrição ${i + 1}` },
  })),
} as any);

const createMockFile = (name: string, size: number, type: string): File => {
  const file = new File([], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

describe('Tela 3: Checklist (inspections/[id].vue)', () => {
  let wrapper: VueWrapper<any>;
  let store: ReturnType<typeof useInspectionsStore>;

  const findButton = (text: string) => wrapper.findAll('button').find(btn => btn.text().includes(text));

  beforeEach(async () => {
    vi.clearAllMocks();
    window.alert = vi.fn();

    const pinia = createTestingPinia({
      createSpy: vi.fn,
      stubActions: false,
    });

    store = useInspectionsStore(pinia);
    store.currentInspection = getMockInspection();
    store.fetchInspectionById = vi.fn().mockResolvedValue(getMockInspection());
    store.updateChecklistItem = vi.fn().mockResolvedValue({});
    store.uploadEvidence = vi.fn().mockResolvedValue({ id: 2, fileName: 'test.jpg', filePath: 'uploads/test.jpg' });
    store.downloadEvidence = vi.fn().mockResolvedValue(new Blob());
    store.deleteEvidence = vi.fn().mockImplementation(async (item, evidence) => {
      // Simula a remoção da evidência do array
      const index = item.evidences.findIndex((e: ItemEvidence) => e.id === evidence.id);
      if (index !== -1) {
        item.evidences.splice(index, 1);
      }
      return {};
    });

    wrapper = mount(ChecklistPage, {
      global: {
        plugins: [vuetify, pinia],
        stubs: {
          VTooltip: {
            template: '<div><slot name="activator" /></div>',
          },
          VDialog: {
            template: '<div data-stub="v-dialog" v-if="modelValue"><slot /></div>',
            props: ['modelValue'],
          },
          VOverlay: {
            template: '<div data-stub="v-overlay" v-if="modelValue"><slot /></div>',
            props: ['modelValue'],
          },
          VProgressCircular: true,
        },
      },
    });

    await flushPromises();
  });

  afterEach(() => {
    wrapper.unmount();
  });

  it('deve buscar a inspeção e selecionar o primeiro ponto ao montar', () => {

    expect(store.fetchInspectionById).toHaveBeenCalledWith(123);

    expect(wrapper.vm.selectedPoint).not.toBeNull();

    expect(wrapper.vm.selectedPoint?.id).toBe(1);
  });

  describe('2. Mudança de Status e Salvamento', () => {
    it('abre um modal de confirmação ao tentar mudar o status', async () => {

      const conformeBtn = findButton('Conforme');

      expect(conformeBtn).toBeDefined();

      await conformeBtn!.trigger('click');

      expect(wrapper.vm.isStatusConfirmOpen).toBe(true);
    });
    it('chama updateChecklistItem ao confirmar a mudança de status', async () => {

      // Simula a interação do usuário que leva à chamada
      wrapper.vm.requestStatusChange(3); // Usuário clica em "Não Conforme"

      await wrapper.vm.confirmStatusChange(); // Usuário confirma no modal

      await flushPromises(); // Espera as promises (actions) resolverem

      // Verificamos diretamente a action da store, que é o efeito final desejado.
      expect(store.updateChecklistItem).toHaveBeenCalled();
    });
    it('desativa os campos quando o status é "Pendente"', () => {

      expect(wrapper.vm.isPendente).toBe(true);

      const textarea: any = wrapper.find('textarea');

      const fileInput: any = wrapper.find('input[type="file"]');

      expect(textarea.attributes('disabled')).not.toBeUndefined();

      expect(fileInput.attributes('disabled')).not.toBeUndefined();
    });
  });

  describe('3. Upload de Evidências', () => {
    beforeEach(async () => {
      store.currentInspection.items[0].statusId = 2; // Garante que o item não está pendente
      wrapper.vm.selectedPoint = store.currentInspection.items[0];
      await wrapper.vm.$nextTick();
    });

    it('chama updateChecklistItem e uploadEvidence quando um arquivo é salvo', async () => {
      const mockFile = createMockFile('test.jpg', 1024, 'image/jpeg');

      // Simula que o usuário selecionou um arquivo
      wrapper.vm.stagedFile = [mockFile];

      // Chama a função de salvar diretamente
      await wrapper.vm.saveCurrentPoint();

      expect(store.updateChecklistItem).toHaveBeenCalled();
      // A asserção crucial: verifica se a store foi chamada com o ARQUIVO
      expect(store.uploadEvidence).toHaveBeenCalledWith(
        wrapper.vm.selectedPoint.masterPointId,
        mockFile
      );
    });

    it('mostra um alerta de erro se o upload falhar', async () => {
      const uploadError = new Error('Upload failed');
      store.uploadEvidence.mockRejectedValue(uploadError);

      // Simula a seleção de um arquivo e chama a função de salvar
      wrapper.vm.stagedFile = [createMockFile('fail.jpg', 1024, 'image/jpeg')];
      await wrapper.vm.saveCurrentPoint();

      await flushPromises(); // Espera a promise da action ser rejeitada

      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Erro ao salvar: Upload failed'));
    });
  });

  describe('4. Gestão de Evidências', () => {
    it('abre o modal "Gerir Evidências" e mostra a contagem correta', async () => {

      const manageBtn = findButton('Gerir Evidências');

      expect(manageBtn).toBeDefined();

      const evidenceCount = wrapper.vm.selectedPoint.evidences.length;

      expect(manageBtn!.text()).toContain(`(${evidenceCount})`);

      await manageBtn!.trigger('click');

      expect(wrapper.vm.isEvidenceManagerOpen).toBe(true);
    });
  });

  describe('5. Finalização', () => {

    it('deve ter o botão "Revisar e Finalizar" DESABILITADO se o checklist estiver incompleto', async () => {
      // Arrange: A store já é iniciada com uma inspeção incompleta por padrão.
      const finalizeButton = findButton('Revisar e Finalizar');

      // Assert
      expect(finalizeButton).toBeDefined();
      // Verificamos que o atributo 'disabled' existe, o que é verdade para botões desabilitados.
      expect(finalizeButton!.attributes('disabled')).toBeDefined();

      // Act: Tentamos clicar para garantir que nada acontece
      await finalizeButton!.trigger('click');

      // Assert: Nenhuma navegação ou alerta deve ocorrer
      expect(mockRouter.push).not.toHaveBeenCalled();
      expect(window.alert).not.toHaveBeenCalled();
    });
  });

  it('deve HABILITAR o botão e navegar para a tela de revisão se o checklist estiver completo', async () => {
    // Arrange: Prepara o estado com uma inspeção completa.
    store.currentInspection = getMockInspection(true);
    await wrapper.vm.$nextTick(); // Espera o Vue reagir à mudança na store

    // Encontramos o botão pelo novo texto
    const finalizeButton = findButton('Revisar e Finalizar');
    expect(finalizeButton).toBeDefined();

    // Assert: O botão agora deve estar habilitado (não possui o atributo 'disabled')
    expect(finalizeButton!.attributes('disabled')).toBeUndefined();

    // Act: Simula o clique no botão.
    await finalizeButton!.trigger('click');

    // Assert: Verifica se a navegação foi chamada com a URL correta.
    expect(mockRouter.push).toHaveBeenCalledWith(`/inspections/${store.currentInspection.id}/finalize`);
    expect(window.alert).not.toHaveBeenCalled();
  });

  describe('4. Gestão de Evidências', () => {
    let evidence: ItemEvidence;

    beforeEach(() => {
      evidence = store.currentInspection.items[0].evidences[0];
      wrapper.vm.isEvidenceManagerOpen = true;
    });

    it('abre o modal "Gerir Evidências" e mostra a contagem correta', async () => {
      const manageBtn = findButton('Gerir Evidências');
      expect(manageBtn).toBeDefined();

      const evidenceCount = wrapper.vm.selectedPoint.evidences.length;
      expect(manageBtn!.text()).toContain(`(${evidenceCount})`);

      await manageBtn!.trigger('click');
      expect(wrapper.vm.isEvidenceManagerOpen).toBe(true);
    });

    it('deve chamar downloadEvidence quando clicar no botão Baixar', async () => {
      await wrapper.vm.$nextTick(); // Aguarda renderização do modal

      const downloadBtn = wrapper.find('[data-testid="download-btn"]');
      expect(downloadBtn.exists()).toBe(true);

      await downloadBtn.trigger('click');
      expect(store.downloadEvidence).toHaveBeenCalledWith(
        wrapper.vm.selectedPoint,
        evidence
      );
    });

    it('deve abrir modal de confirmação ao clicar em Excluir', async () => {
      await wrapper.vm.$nextTick();

      const deleteBtn = wrapper.find('[data-testid="delete-btn"]');
      expect(deleteBtn.exists()).toBe(true);

      await deleteBtn.trigger('click');
      expect(wrapper.vm.isDeleteConfirmOpen).toBe(true);
      expect(wrapper.vm.evidenceToDelete).toEqual(evidence);
    });

    it('deve chamar deleteEvidence ao confirmar exclusão', async () => {
      wrapper.vm.isDeleteConfirmOpen = true;
      wrapper.vm.evidenceToDelete = evidence;

      await wrapper.vm.executeDelete();

      expect(store.deleteEvidence).toHaveBeenCalledWith(
        wrapper.vm.selectedPoint,
        evidence
      );
      expect(wrapper.vm.isDeleteConfirmOpen).toBe(false);
      expect(wrapper.vm.evidenceToDelete).toBeNull();
    });

    it('deve fechar o modal de gerenciamento se não houver mais evidências', async () => {
      // Configura para ter apenas 1 evidência
      store.currentInspection.items[0].evidences = [evidence];
      wrapper.vm.isEvidenceManagerOpen = true;
      wrapper.vm.selectedPoint = store.currentInspection.items[0];
      wrapper.vm.evidenceToDelete = evidence;

      // Garante que o modal está aberto antes da exclusão
      expect(wrapper.vm.isEvidenceManagerOpen).toBe(true);

      // Simula a exclusão da única evidência
      await wrapper.vm.executeDelete();

      // Verifica se o modal foi fechado
      expect(wrapper.vm.isEvidenceManagerOpen).toBe(false);

      // Verifica se o modal de confirmação foi fechado
      expect(wrapper.vm.isDeleteConfirmOpen).toBe(false);
      expect(wrapper.vm.evidenceToDelete).toBeNull();
    });
  });
});
