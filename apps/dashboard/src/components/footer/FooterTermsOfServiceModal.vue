<template>
    <span class="tosLink" @click="visible = true">{{$t('termsOfService.termsOfService')}}</span>
    <Dialog
        modal
        v-model:visible="visible"
        :draggable="false"
        class="tosModal"
        >
        <template #header>
           {{ $t('termsOfService.termsOfService') }}
        </template>
        <div>
          <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
             <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p>
          <!-- TOS is also english so we can leave this untranslated -->
            <div class="tosText" v-html="tos"></div>
        </div>
        <template #footer>
            <Button label="Ok" @click="visible = false" autofocus />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import { ref } from 'vue';
import termsOfService from '@/locales/termsOfService.md?raw';
import { marked } from 'marked';


const tos = marked(termsOfService);
const visible = ref(false);
</script>
<style>

.tosLink {
  color: red;
}

.tosLink:hover {
  cursor: pointer;
  text-decoration-line: underline;
}

.tosModal {
    max-width: 75vw
}

.tosText * {
  color: var(--text-color);
}

</style>
