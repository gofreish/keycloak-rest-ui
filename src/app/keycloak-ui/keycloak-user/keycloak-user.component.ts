import { Component, OnInit, WritableSignal, signal } from '@angular/core';
import { TableModule } from 'primeng/table';
import { UserService } from '../service/user.service';
import { KeycloakUser } from '../model/user.model';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { LoadingComponent } from '../../shared/loading.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-keycloak-user',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    ToolbarModule,
    CardModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    CheckboxModule,
    ToastModule,
    LoadingComponent
  ],
  providers: [MessageService],
  templateUrl: './keycloak-user.component.html',
})
export class KeycloakUserComponent implements OnInit{

    users: WritableSignal<KeycloakUser[]> = signal([]);
    isLoading: WritableSignal<boolean> = signal(false);
    newUserForm!: FormGroup;
    showNewUserFormDialog: boolean = false;
    updateUserForm!: FormGroup;
    updateUserFormDialog: boolean = false;

    constructor(
        private userService: UserService,
        private router: Router,
        private fb: FormBuilder,
        private messageService: MessageService
    ){}

    ngOnInit(): void {
        this.initForms();
        this.updateUserList();
    }

    updateUserList(){
        this.isLoading.update(value => !value);
        this.userService.getAllUsers().then(
            resp => {
                this.users.set(resp);
                console.log(resp);
            }
        ).catch(
            err => console.log(err)
        ).finally(() => this.isLoading.update(value => !value));
    }

    initForms(){
        this.newUserForm = this.fb.group({
            username: ["", Validators.required],
            firstName: ["", Validators.required],
            lastName: ["", Validators.required],
            email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
            password: ["", Validators.required],
            passwordConfirm: ["", Validators.required],
            enabled: [true, Validators.required]
        });
        this.updateUserForm = this.fb.group({
            id: [""],
            username: ["", Validators.required],
            firstName: ["", Validators.required],
            lastName: ["", Validators.required],
            email: ["", [Validators.required, Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")]],
            enabled: [true, Validators.required]
        });
    }

    async newUserFormSubmit(){
        const formUser = this.newUserForm.value as { username: string, firstName: string, lastName: string, email: string, password: string, passwordConfirm: string, enabled: boolean};
        if(formUser.password != formUser.passwordConfirm){
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Les deux mots de passes ne correspondent pas" });
            return;
        }
        this.isLoading.update(value => !value);
        try {
            //Création de l'utilisateur
            const newUser: KeycloakUser = {
                id: "",
                username: formUser.username,
                firstName: formUser.firstName,
                lastName: formUser.lastName,
                email: formUser.email,
                enabled: formUser.enabled
            }
            await this.userService.createUser(newUser);
            //rafraichissement de la liste
            this.users.set(
                await this.userService.getAllUsers()
            );
            console.log(this.users());
            console.log(formUser.username);
            //on retrouve l'utilisateur fraichement créer
            const foundedUser = this.users().find(
                user => user.username === formUser.username.toLowerCase()
            );
            if(foundedUser==undefined){
                this.messageService.add({ severity: 'error', summary: 'Erreur', detail: "Oups une erreur s'est produite" });
                return;
            }
            //définission du mot de passe
            await this.userService.resetUserPassword(foundedUser.id, formUser.password);
            this.messageService.add({ severity: 'info', summary: 'Terminé', detail: "Opération terminée avec succès" });
            //On réinitialise le formulaire
            this.newUserForm.patchValue({
                id: "",
                username: "",
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                passwordConfirm: "",
                enabled: true
            });
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `${error}` });
        }finally{
            this.isLoading.update(value => !value);
            this.showNewUserFormDialog = false;
        }
    }

    async updateUserFormSubmit(){
        const formUser = this.updateUserForm.value as KeycloakUser;
        this.isLoading.update(value => !value);
        try {
            //c'est un update
            const userIndex = this.findIndexById(formUser.id);
            if (userIndex) {
                //user trouvé
                await this.userService.updateUser(formUser);
            }
            this.updateUserList();
            this.messageService.add({ severity: 'info', summary: 'Terminé', detail: "Opération terminée avec succès" });
            this.updateUserForm.patchValue({
                id: "",
                username: "",
                firstName: "",
                lastName: "",
                email: "",
                enabled: true
            });
        } catch (error) {
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: `${error}` });
        }finally{
            this.isLoading.update(value => !value);
            this.updateUserFormDialog=false;
        }
    }

    updateForm(user: KeycloakUser){
        this.updateUserForm.patchValue({
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            enabled: user.enabled
        });
        this.updateUserFormDialog = true;
    }

    seeDetail(id: string){
        console.log(id);
        this.router.navigateByUrl(`keycloak/users/detail/${id}`);
    }

    findIndexById(id: string): number|undefined{
        const index = this.users().findIndex(
            user => user.id === id
        );
        return index != -1 ? index : undefined;
    }
}
