<template>
  <CardComponent :header="$t('app.Points of Sale')" class="w-full">
    <DataTable :value="listOfPOS">
      <Column field="name" header="Title"/>
      <Column field="owner.firstName" header="Owner"/>
      <Column headerStyle="width: 3rem; text-align: center" bodyStyle="text-align: center; overflow: visible">
        <template #body="slotProps">
          <Button
              @click="$router.push({name: 'pointOfSaleInfo', params: {id: slotProps.data.id}})"
              type="button"
              icon="pi pi-info-circle"
              outlined
          />
        </template>
      </Column>
    </DataTable>
  </CardComponent>
</template>
<script setup lang="ts">
import CardComponent from "@/components/CardComponent.vue";
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import { onMounted, ref } from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import { usePointOfSaleStore } from "@/stores/pos.store";
const userStore = useUserStore();
const pointOfSaleStore = usePointOfSaleStore();


onMounted(async () => {

  const userId = userStore.getCurrentUser.user !== null ? userStore.getCurrentUser.user.id : undefined;
  if (userId){
    listOfPOS.value = await pointOfSaleStore.getUserPointsOfSale(userId).then((resp)=> {return resp.data.records;});
  }

});
const listOfPOS = ref();
</script>

<style scoped lang="scss">
</style>
