import { AuthenticationResponse, UserResponse } from "@sudosos/sudosos-client";
import ApiService from "../services/ApiService";
interface AuthStoreState {
    user: UserResponse | null;
    roles: string[];
    organs: UserResponse[];
    token: string | null;
    acceptedToS: string | null;
}
export declare const useAuthStore: import("pinia").StoreDefinition<"auth", AuthStoreState, {
    getToken(): string | null;
    getToS(): string | null;
    getUser(): UserResponse | null;
}, {
    handleResponse(res: AuthenticationResponse, service: ApiService): void;
    gewisPinlogin(userId: string, pinCode: string, service: ApiService): Promise<void>;
    ldapLogin(accountName: string, password: string, service: ApiService): Promise<void>;
    gewisWebLogin(nonce: string, token: string, service: ApiService): Promise<void>;
    externalPinLogin(userId: number, pin: string, service: ApiService): Promise<void>;
    eanLogin(eanCode: string, service: ApiService): Promise<void>;
    apiKeyLogin(key: string, userId: number, service: ApiService): Promise<void>;
    logout(): void;
}>;
export {};
