import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { UserProfile } from '../model/user-profile.model';
import { KEYCLOAK_CONFIG_DEV } from '../keycloak-config-dev';

@Injectable({
  providedIn: 'root'
})
export class KeycloakService {
    private _keycloack: Keycloak|undefined;
    private _profile: UserProfile|undefined;

    get keycloack(){
        if(!this._keycloack){
            this._keycloack = new Keycloak(KEYCLOAK_CONFIG_DEV);
        }
        return this._keycloack;
    }

    get profile(): UserProfile | undefined{
        return this._profile;
    }

    constructor() { }

    async init(){
        console.log("Authenticating");
        
        const authenticated = await this.keycloack.init({
            onLoad: 'login-required'
        });
        if(authenticated){
            console.log("AUthenticated");
            this._profile = (await this.keycloack.loadUserProfile()) as UserProfile;
            this._profile.token = this.keycloack.token;
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
