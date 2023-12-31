<template>
  <CardComponent
    :header="$t('c_currentBalance.balance')"
    :action="showOption ? $t('c_currentBalance.Increase balance') : ''"
    routerLink="balance"
  >
    <div class="body">
      <h1>{{ displayBalance }}</h1>
    </div>
  </CardComponent>
</template>

<script setup lang="ts">
import CardComponent from '@/components/CardComponent.vue';
import { useUserStore } from '@sudosos/sudosos-frontend-common';
import { computed, ref, watch } from 'vue';
import type { UserResponse } from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import { formatPrice } from "@/utils/formatterUtils";

const props = defineProps({
  user: {
    type: Object as () => UserResponse,
    required: false
  },
  showOption: {
    type: Boolean,
    required: true,
  }
});

const userStore = useUserStore();
const balanceFromApi = ref<string | undefined>(undefined);

// Watch for changes on props.user
watch(() => props.user, async (newUser, oldUser) => {
  if (newUser) {
    const response = await apiService.balance.getBalanceId(newUser.id);
    balanceFromApi.value = formatPrice(response.data.amount);
  }
}, { immediate: true });

const displayBalance = computed(() => {
  if (props.user) {
    return balanceFromApi.value;
  } else {
    const balanceInCents = userStore.getCurrentUser.balance;
    if (!balanceInCents) return undefined;
    const balanceInEuros = (balanceInCents.amount.amount / 100).toFixed(2);
    return `€${balanceInEuros}`;
  }
});
</script>

<style scoped lang="scss">
h1 {
  font-size: 50px;
  text-align: center;
  font-family: Raleway, sans-serif !important;
  font-weight: 500;
}
</style>
