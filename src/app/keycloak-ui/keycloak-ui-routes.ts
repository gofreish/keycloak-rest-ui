import { Route } from "@angular/router";
import { IndexComponent } from "./index/index.component";
import { KeycloakUserComponent } from "./keycloak-user/keycloak-user.component";
import { UserDetailComponent } from "./keycloak-user/user-detail/user-detail.component";
import { KeycloakRoleComponent } from "./keycloak-role/keycloak-role.component";
import { KeycloakRoleDetailComponent } from "./keycloak-role/keycloak-role-detail/keycloak-role-detail.component";

export const KEYCLOAK_UI_ROUTES: Route = {
    path: "keycloak",
    children: [
        {path: "", component: IndexComponent},
        {
            path: "users", 
            children: [
                {path: "", component: KeycloakUserComponent},
                {path: "detail/:id", component: UserDetailComponent}
            ]
        },
        {
            path: "roles", 
            children: [
                {path: "", component: KeycloakRoleComponent},
                {path: "detail/:name", component: KeycloakRoleDetailComponent}
            ]
        }
    ]
}