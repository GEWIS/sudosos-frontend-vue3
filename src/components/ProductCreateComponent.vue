<template>
  <Dialog modal v-model:visible="visible" :header="$t('manageProducts.Add product')" class="w-auto flex w-8"
    @update:visible="closeDialog();">
    <form @submit="handleProductCreate">
      <div class="field grid">
        <label for="name" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_productInfoModal.Name') }}</label>
        <div class="col-12 md:col-10">
          <InputText id="name" v-model="name" type="text" v-bind="nameAttrs" />
          <span class="error-text">{{ errors.name }}</span>
        </div>
      </div>
      <div class="field grid">
        <label for="category" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_productInfoModal.Category') }}</label>
        <div class="col-12 md:col-10">
          <Dropdown :placeholder="$t('c_productEditModal.Please select')" :options="categories" optionLabel="name"
            v-model="category" id="category" v-bind="categoryAttrs" />
          <span class="error-text">{{ errors.category }}</span>
        </div>
      </div>
      <div class="field grid">
        <label for="vat" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_productEditModal.VAT') }}</label>
        <div class="col-12 md:col-10">
          <Dropdown :placeholder="$t('c_productEditModal.Please select VAT')" :options="vatGroups"
            optionLabel="percentage" v-model="vat" v-bind="vatAttrs" />
          <span class="error-text">{{ errors.vatGroup }}</span>
        </div>
      </div>
      <div class="field grid" v-if="category && null === 'Alcoholic'">
        <label for="alcohol" class="col-12 mb-2 md:col-2 md:mb-0">
          {{ $t('c_productEditModal.Alcohol Percentage') }}
        </label>
        <div class="col-12 md:col-10">
          <InputNumber id="alcohol" placeholder="" :options="vatGroups" v-model="alcoholPercentage"
            v-bind="alcoholPercentageAttrs" />
          <span class="error-text">{{ errors.alcoholPercentage }}</span>
        </div>
      </div>
      <div class="field grid">
        <label for="price" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_productEditModal.Price') }}</label>
        <div class="col-12 md:col-10">
          <InputNumber id="price" placeholder="" v-model="price" v-bind="priceAttrs" :max-fraction-digits="2" />
          <span class="error-text">{{ errors.price }}</span>
        </div>
      </div>
      <div class="field grid">
        <div class="col-12 md:col-10">
          <label for="img" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t("c_productEditModal.Image") }}</label>
          <FileUpload id="img" mode="basic" name="productImg" accept="image/*" @select="onImgUpload($event)" />
        </div>
      </div>
      <div class="field grid">
        <label for="owner" class="col-12 mb-2 md:col-2 md:mb-0">{{ $t('c_POSCreate.Owner') }}</label>
        <div class="col-12 md:col-10">
          <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
            v-model="owner" id="owner" v-bind="ownerAttrs" />
          <span class="error-text">{{ errors.owner }}</span>
        </div>
      </div>
      <div class="flex justify-content-end">
        <Button type="submit" class="save-button">{{ $t('c_productEditModal.save') }}</Button>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { onMounted, ref } from 'vue';
import type { Ref } from 'vue';
import type {
  BaseUserResponse,
  CreateProductRequest,
  ProductCategoryResponse,
  VatGroupResponse
} from '@sudosos/sudosos-client';
import apiService from '@/services/ApiService';
import Dropdown from 'primevue/dropdown';
import FileUpload from 'primevue/fileupload';
import { useAuthStore } from '@sudosos/sudosos-frontend-common';
import InputNumber from 'primevue/inputnumber';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import { useForm } from 'vee-validate';
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import { handleError } from "@/utils/errorUtils";

const productSchema = toTypedSchema(
  yup.object({
    name: yup.string().required(),
    category: yup.mixed<ProductCategoryResponse>().required(),
    vatGroup: yup.mixed<VatGroupResponse>().required(),
    alcoholPercentage: yup.number(),
    price: yup.number().required(),
    owner: yup.mixed<BaseUserResponse>().required()
  })
);

const { defineField, handleSubmit, errors } = useForm({
  validationSchema: productSchema
});

const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();
const visible: Ref<boolean | undefined> = ref(false);
const emit = defineEmits(['update:visible', 'productCreated']);
const categories: Ref<ProductCategoryResponse[]> = ref([]);
const vatGroups: Ref<VatGroupResponse[]> = ref([]);
const organsList: Ref<BaseUserResponse[]> = ref([]);
const [name, nameAttrs] = defineField('name');
const [category, categoryAttrs] = defineField('category');
const [vat, vatAttrs] = defineField('vatGroup');
const [price, priceAttrs] = defineField('price');
const [owner, ownerAttrs] = defineField('owner');
const [alcoholPercentage, alcoholPercentageAttrs] = defineField('alcoholPercentage');
const productImage: Ref<File | undefined> = ref();

onMounted(async () => {
  const categoriesResp = await apiService.category.getAllProductCategories();
  // I'm gonna go ahead and hardcode this because
  // if there are more than 25 fucking categories we are doing something wrong.
  categories.value = categoriesResp.data.records;
  const vatGroupsResp = await apiService.vatGroups.getAllVatGroups();
  vatGroups.value = vatGroupsResp.data.records;
  organsList.value = authStore.organs;
});

const handleProductCreate = handleSubmit(async (values) => {
  const createProductRequest: CreateProductRequest = {
    name: values.name,
    priceInclVat: {
      amount: values.price * 100,
      currency: 'EUR',
      precision: 2
    },
    vat: values.vatGroup.id,
    category: values.category.id,
    alcoholPercentage: values.alcoholPercentage || 0,
    ownerId: values.owner.id
  };
  await apiService.products.createProduct(createProductRequest).then((resp) => {
    if (productImage.value)
      apiService.products.updateProductImage(resp.data.id, productImage.value);
    toast.add({
      severity: 'success',
      summary: t('successMessages.success'),
      detail: t('successMessages.productCreated'),
      life: 3000,
    });
    emit('productCreated');
    emit('update:visible', false);

  }).catch((err) => handleError(err, toast));
});

const closeDialog = () => {
  emit('update:visible', false);
};

const onImgUpload = (event: any) => {
  //@ts-ignore
  productImage.value = event.files[0];
};
</script>

<style scoped lang="scss">
</style>
