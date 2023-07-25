import {defineStore} from "pinia";
import type {ContainerWithProductsResponse} from "@sudosos/sudosos-client";
import {ContainersApi} from "@sudosos/sudosos-client";
import ApiService from "@/services/ApiService";

export const useContainerStore = defineStore('container', {
    state: () => ({
        container: null as ContainerWithProductsResponse,
    }),
    getters: {
        getContainer(): ContainerWithProductsResponse | null {
            return this.container;
        }
    },
    actions: {
        async fetchContainer(id: number){

            const resp = await ApiService.container.getSingleContainer(id);
            this.container = resp.data;
        },
        async getPublicContainers(){
            const response = await ApiService.container.getPublicContainers();
            return response.data;
        },
        async getUsersContainers(id: number) {
            const response = await ApiService.user.getUsersContainers(id);
            return response.data;
        }
    }
});