import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoleService } from '../../service/role.service';
import { DefaultRole } from '../../model/role.model';
import { AccordionModule } from 'primeng/accordion';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { CardModule } from 'primeng/card';
import { KeycloakUser } from '../../model/user.model';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { UserSelectorComponent } from '../../keycloak-user/user-selector/user-selector.component';
import { firstValueFrom, forkJoin } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { KeycloakLoadingComponent } from '../../shared/keycloak-loading.component';

@Component({
  selector: 'app-keycloak-role-detail',
  standalone: true,
  imports: [
    AccordionModule,
    InputGroupModule,
    InputGroupAddonModule,
    CardModule,
    KeycloakLoadingComponent,
    ChipModule,
    DialogModule,
    ButtonModule,
    UserSelectorComponent,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './keycloak-role-detail.component.html',
})
export class KeycloakRoleDetailComponent implements OnInit{
    role = signal({...DefaultRole});
    users: WritableSignal<KeycloakUser[]> = signal([]);
    isLoading: WritableSignal<boolean> = signal(false);
    selectUserDialog: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private roleService: RoleService,
        private messageService: MessageService
    ){}

    ngOnInit(): void {
        const roleName = this.route.snapshot.paramMap.get('name');
        if(roleName){
            this.isLoading.update(value => !value);
            this.initData(roleName)
            .then()
            .catch(
                err => console.log(err)
            )
            .finally(
                () => this.isLoading.update(value => !value)
            );
        }
    }

    /**
     * Initialise les données du component
     * @param roleName 
     */
    async initData(roleName: string){
        try{
            this.role.set(
                await this.roleService.getClientRoleByName(roleName)
            );
            this.users.set(
                await this.roleService.getUsersOfClientRole(roleName)
            )
        }catch(err){
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Problème de connexion" });
            console.log(err);
        }
    }

    //FIXME: Enlever les users ayant déjà le rôle et persister le nouveau
    async usersSelected(users: KeycloakUser[]){
        this.isLoading.update(value => !value);
        try {
            //Retirer les users ayant déjà le rôle
            const filteredUsers = users.filter(
                user =>
                    !this.users().find(
                        componentUser => componentUser.id===user.id 
                    )
            );
            //Persister les User restant
            await firstValueFrom(
                forkJoin(
                    filteredUsers.map(
                        user => this.roleService.addClientRoleToUser(user.id, this.role())
                    )
                )
            );
            //refaire une requête des users vers le back 
            this.users.set(
                await this.roleService.getUsersOfClientRole(this.role().name)
            );
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Oups, opération interrompue" });
            console.log(error);
        }finally{
            this.selectUserDialog = false;
            this.isLoading.update(value => !value);
        }
    }

    abortUserSelection(event: any){
        console.log(event);
        this.selectUserDialog = false;
    }

    async removeUserRole(event: any, user: KeycloakUser){
        //TODO: Supprimer le user de keycloak
        await this.roleService.removeClientRoleToUser(user.id, this.role());
        //TODO: refaire une requête des users vers le back 
        this.users.set(
            await this.roleService.getUsersOfClientRole(this.role().name)
        );
    }
}
