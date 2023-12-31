<template>
  <div class="flex flex-column h-screen">
    <main class="flex flex-column flex-grow-1 text-center mx-auto my-7 max-w-21rem">
      <img class="max-h-9rem block mx-auto my-0" src="@/assets/img/bier.png" alt="logo"/>
      <div class="text-900 text-5xl mt-0 mx-auto mb-2 w-full">{{ $t('login.SudoSOS Login') }}</div>
      <Button
        id="login-gewis-button"
        @click="loginViaGEWIS"
        severity="success"
        class="my-3 mx-auto w-full flex justify-content-center align-items-center"
      >
        <img class="max-h-2rem py-1 mr-3" src="@/assets/img/gewis-branding.svg" alt="GEWIS"/>
        {{ $t('login.Login via GEWIS') }}
      </Button>
      <hr class="mt-6 mb-4 max-w-21rem w-full"/>
      <form class="flex flex-column" @submit="loginHandler">
        <label id="input-description" for="username">
          {{ $t('login.Username') }}
        </label>
        <span class="p-float-label with-error">
          <InputText
              type="text"
              v-bind="username"
              size="large"
              name="username"
              class="w-full pt-2 pb-0 pl-1 h-4rem"
              :class="{ 'p-invalid': loginForm.errors.value.username }"
          />
          <label :class="{ 'contains-text': username.modelValue }" for="username"
          >{{ $t('login.Username') }}
          </label>
          <small class="p-error">
            <i v-if="loginForm.errors.value.username" class="pi pi-exclamation-circle"/>
            {{ loginForm.errors.value.username }}
          </small>
        </span>
        <label class="text-900" for="password">
          {{ $t('login.Password') }}
        </label>
        <span class="p-float-label with-error">
          <InputText
              type="password"
              v-bind="password"
              size="large"
              name="password"
              class="w-full pt-2 pb-0 pl-1 h-4rem"
              :class="{ 'p-invalid': loginForm.errors.value.password }"
          />
          <label :class="{ 'contains-text': password.modelValue }" for="password"
          >{{ $t('login.Password') }}
          </label>
          <small class="p-error">
            <i v-if="loginForm.errors.value.password" class="pi pi-exclamation-circle"/>
            {{ loginForm.errors.value.password }}
          </small>
        </span>
        <Button
          type="submit"
          id="login-button"
          class="my-3 mx-auto w-full flex justify-content-center align-items-center"
        >
          {{ $t('login.Login') }}
        </Button>
        <div class="text-900 underline" @click="resetPassword">
          {{ $t('login.Password reset') }}
        </div>
      </form>
    </main>
    <CopyrightBanner/>
  </div>
</template>

<script setup lang="ts">

import CopyrightBanner from "@/components/CopyrightBanner.vue";
import { useRoute } from "vue-router";
import { onBeforeMount } from "vue";
import { useUserStore, useAuthStore, getTokenFromStorage } from "@sudosos/sudosos-frontend-common";
import apiService from "@/services/ApiService";
import router from "@/router";
import { v4 as uuid } from 'uuid';
import { useForm } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import * as yup from 'yup';
import InputText from 'primevue/inputtext';
import { useToast } from 'primevue/usetoast';
import { AxiosError } from 'axios';
import { handleError } from "@/utils/errorUtils";

const authStore = useAuthStore();
const userStore = useUserStore();
const toast = useToast();

const schema = toTypedSchema(
    yup.object({
      username: yup.string().required('This is a required field.'),
      password: yup.string().required('This is a required field.')
    })
);
const loginForm = useForm({
  validationSchema: schema
});

const username = loginForm.defineComponentBinds('username');
const password = loginForm.defineComponentBinds('password');

const route = useRoute();

onBeforeMount(() => {
  if (route.query.token !== undefined) {
    const token = route.query.token as string;
    authStore.gewisWebLogin(uuid(), token, apiService).catch(() => {
      router.replace({ path: "/error" });
    });
  }
});

const loginHandler = loginForm.handleSubmit(async (values) => {

  // Send toHomeView either with or without ToS,
  // router will handle correct routing based on that,
  // but fetching user will result in error.
  try {
    if (values.username.includes('@')) {
      await apiService.authenticate.localAuthentication({
        accountMail: values.username,
        password: values.password
      }).then((res) => authStore.handleResponse(res.data, apiService));
      if (authStore.getToS == 'ACCEPTED' && authStore.getUser) {
        await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
      } else {
        await router.replace({ path: '/error' });
      }
      toHomeView();
    } else {
      await authStore.gewisLdapLogin(values.username, values.password, apiService);
      if (authStore.getToS == 'ACCEPTED' && authStore.getUser) {
        await userStore.fetchCurrentUserBalance(authStore.getUser.id, apiService);
      } else {
        await router.replace({ path: '/error' });
      }
      toHomeView();
    }
  } catch (err) {
    console.error('ERROR?',getTokenFromStorage());
    handleError(err as AxiosError, toast);
  }
});

const loginViaGEWIS = () => {
  window.location.href = `https://gewis.nl/token/${import.meta.env.VITE_APP_GEWIS_TOKEN}`;
};

const resetPassword = () => {
  router.push({ name: 'passwordreset' });
};

const toHomeView = () => {
  router.push({ name: 'home' });
};
</script>

<style scoped lang="scss">
//TODO Fix the amount of css used related to #14 and #29

.p-error {
  display: block;
  font-size: 12px;
  text-align: left;
  line-height: 18px;
  min-height: 25px;
}

.p-error > i {
  font-size: 12px;
  margin-right: 3.6px;
  line-height: 12px;
}

.p-float-label label {
  top: 30%;
  margin-top: 0;
  left: 12px;
}

.contains-text,
.p-float-label input:focus ~ label,
.p-float-label label ~ input:focus {
  margin-top: 0;
  top: 8px !important;
}

.p-invalid {
  background-color: #fef0f0;
}

.p-inputtext {
  margin-bottom: 0.5rem;
}

.p-inputtext {
  margin-bottom: 0.5rem;
}
</style>
