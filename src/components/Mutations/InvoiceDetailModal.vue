<template>
  <div class="flex flex-column">
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.total") }}</p></div>
      <div class="transaction-right-column"><p>{{ formatPrice(invoiceInfo.amount) }}</p></div>
    </div>
    <div v-if="invoiceInfo.invoice?.to" class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.to") }}</p></div>
      <div class="transaction-right-column">
        <p>
          {{ invoiceInfo.invoice?.to.firstName + ' ' + invoiceInfo.invoice?.to.lastName }}
        </p>
      </div>
    </div>
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferDesc") }}</p></div>
      <div class="transaction-right-column"><p>{{ invoiceInfo.invoice?.description }}</p></div>
    </div>
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferStatus") }}</p></div>
      <div class="transaction-right-column"><p>{{ invoiceInfo.invoice?.currentState.state }}</p></div>
    </div>
    <div class="flex flex-row justify-content-between">
      <div class="transaction-left-column"><p>{{ $t("transactions.transferType") }}</p></div>
      <div class="transaction-right-column"><p>{{ $t("transactions.invoice") }}</p></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { formatPrice } from "../../utils/formatterUtils";
import type { TransferResponse } from "@sudosos/sudosos-client";

defineProps({
  invoiceInfo: {
    type: Object as () => TransferResponse,
    required: true,
  }
});
</script>
<style scoped lang="scss">
</style>
