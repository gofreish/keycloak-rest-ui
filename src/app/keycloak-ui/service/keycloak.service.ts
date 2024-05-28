import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { UserProfile } from '../model/user-profile.model';
import { KEYCLOAK_CONFIG } from '../keycloak-config';
import { firstValueFrom, map } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
    private _keycloack: Keycloak|undefined;
    private _profile: UserProfile|undefined;

    private _clientUUID: string = "";

    get clientUUID(): string{
        return this._clientUUID;
    }
    
    get keycloack(){
        if(!this._keycloack){
            this._keycloack = new Keycloak(KEYCLOAK_CONFIG);
        }
        return this._keycloack;
    }

    get profile(): UserProfile | undefined{
        return this._profile;
    }

    constructor(
        private httpClient: HttpClient
    ) { }

    private getClientUUID(): Promise<string>{
        return firstValueFrom<string>(
            this.httpClient.get<{id: string, clientId: string}[]>(`${KEYCLOAK_CONFIG.url}/admin/realms/${KEYCLOAK_CONFIG.realm}/clients`).pipe(
                map(
                    clients => {
                        const client = clients.find(
                            client => client.clientId==KEYCLOAK_CONFIG.clientId
                        );
                    return client ? client.id : "";
                    }
                )
            )
        );
    }

    async init(){
        console.log("Authenticating");
        
        const authenticated = await this.keycloack.init({
            onLoad: 'login-required'
        });
        if(authenticated){
            console.log("AUthenticated");
            this._profile = (await this.keycloack.loadUserProfile()) as UserProfile;
            this._profile.token = this.keycloack.token;
            this._clientUUID = await this.getClientUUID();
        }
    }

    login(){
        return this.keycloack.login();
    }

    logout(){
        this.keycloack.logout({
            redirectUri: "http://localhost:4200"
        });
    }
}
