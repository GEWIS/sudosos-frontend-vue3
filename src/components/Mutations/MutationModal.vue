<template>
  <Dialog
    @show="addListenerOnDialogueOverlay(dialog)"
    :visible="visible"
    modal
    :header="t('c_transactionDetailsModal.transactionDetails')"
    class="w-auto flex w-11 md:w-4" ref="dialog"
  >
    <TransactionDetailModal
        v-if="shouldShowTransaction"
        :transactionInfo="transactionsDetails[props.id]"
        :productsInfo="transactionProducts[props.id]"
    />
    <InvoiceDetailModal v-else-if="shouldShowInvoice" :invoiceInfo="transferDetails[props.id]"/>
    <DepositDetailModal v-else-if="shouldShowDeposit" :depositInfo="transferDetails[props.id]"/>
    <FineDetailModal v-else-if="shouldShowFine" :fine="transferDetails[props.id]"/>
    <template #footer v-if="!shouldShowDeposit && !shouldShowInvoice">
      <div class="flex flex-column align-items-end">
        <Button @click="deleteMutation" severity="danger">
          {{ t('c_transactionDetailsModal.delete').toUpperCase() }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Ref } from 'vue';
import { useTransactionStore } from '@/stores/transaction.store';
import type { TransactionResponse, TransferResponse } from '@sudosos/sudosos-client';
import type { SubTransactionResponse, SubTransactionRowResponse } from '@sudosos/sudosos-client/src/api';
import { useTransferStore } from '@/stores/transfer.store';
import apiService from '@/services/ApiService';
import TransactionDetailModal from '@/components/Mutations/TransactionDetailModal.vue';
import DepositDetailModal from '@/components/Mutations/DepositDetailModal.vue';
import InvoiceDetailModal from '@/components/Mutations/InvoiceDetailModal.vue';
import router from "@/router";
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import FineDetailModal from "@/components/Mutations/FineDetailModal.vue";
import { useI18n } from "vue-i18n";
import { useToast } from "primevue/usetoast";
import type { AxiosError } from "axios";
import { handleError } from "@/utils/errorUtils";
import { FinancialMutationType } from "@/utils/mutationUtils";

const props = defineProps({
  type: {
    type: Object as () => FinancialMutationType,
    required: true
  },
  id: {
    type: Number,
    required: true
  }
});
const { t } = useI18n();

const visible = ref<boolean>(false);
const transactionStore = useTransactionStore();
const transactionsDetails: Ref<{ [id: number]: TransactionResponse }> = ref({});
const transactionProducts: Ref<{ [id: number]: Array<SubTransactionRowResponse> }> = ref({});
const transferStore = useTransferStore();
const transferDetails: Ref<{ [id: number]: TransferResponse }> = ref({});
const dialog: Ref<null | any> = ref(null);
const toast = useToast();

const shouldShowInvoice = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.INVOICE;
});

const shouldShowTransaction = computed(() => {
  if (!transactionsDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.TRANSACTION;
});

const shouldShowDeposit = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.DEPOSIT;
});

const shouldShowFine = computed(() => {
  if (!transferDetails.value[props.id]) return false;
  return props.type === FinancialMutationType.FINE;
});

async function fetchTransferInfo() {
  if (transferDetails.value[props.id]) return; // We already have content!
  await transferStore.fetchIndividualTransfer(props.id, apiService).then(() => {
    transferDetails.value[props.id] = transferStore.transfer as TransferResponse;
  });
}

async function fetchTransactionInfo() {
  if (transactionsDetails.value[props.id]) return; // We already have content!
  transactionStore.fetchIndividualTransaction(props.id, apiService).then(() => {
    if (!transactionStore.transaction) {
      router.replace({ path: '/error' });
      return;
    }
    transactionsDetails.value[props.id] = transactionStore.transaction;
    getProductsOfTransaction(transactionStore.transaction); // Process subtransactions
  });
}

function getProductsOfTransaction(transactionResponse: TransactionResponse): void {
  if (transactionProducts.value[transactionResponse.id]) return; // We already have content!
  let result: Array<SubTransactionRowResponse> = [];
  transactionResponse.subTransactions.forEach((subTransaction: SubTransactionResponse) => {
    subTransaction.subTransactionRows.forEach((subTransactionRow: SubTransactionRowResponse) => {
      result.push(subTransactionRow);
    });
  });
  transactionProducts.value[transactionResponse.id] = result;
}

async function fetchMutation(): Promise<void> {
  if (props.type == FinancialMutationType.TRANSACTION) await fetchTransactionInfo();
  else await fetchTransferInfo();
}

watch(
    () => props.id || props.type,
    async () => {
      await fetchMutation();
    }
);

const deleteMutation = async () => {
  if (shouldShowFine.value) {
    const transferDetail = transferDetails.value[props.id];

    if (!transferDetail || !transferDetail.fine) {
      await router.replace({ path: '/error' });
      return;
    }

    await apiService.debtor.deleteFine(transferDetail.fine.id).then(() => {
      toast.add({
        summary: t('successMessages.success'),
        detail: t('successMessages.fineDeleted'),
        severity: 'success',
        life: 3000,
      });
      router.go(0);
    }).catch((err: AxiosError) => {
      handleError(err, toast);
    });
  } else {
    const transactionsDetail = transactionsDetails.value[props.id];

    if (!transactionsDetail) {
      await router.replace({ path: '/error' });
      return;
    }

    await apiService.transaction.deleteTransaction(transactionsDetail.id).then(() => {
      toast.add({
        summary: t('successMessages.success'),
        detail: t('successMessages.transactionDeleted'),
        severity: 'success',
        life: 3000,
      });
      router.go(0);
    }).catch((err: AxiosError) => {
      handleError(err, toast);
    });
  }
};

</script>

<style scoped lang="scss"></style>
