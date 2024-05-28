
# Keycloak rest ui!

Ce projet vise à créer une application front end qui utilisera l'api rest fournit par **keycloak** pour manipuler les rôle et les utilisateurs d'un client keycloak.

Ce projet utilise la version **24.0.4** de keycloak et la version **18.0.1** de angular. Il est basé sur les composants de [PrimeNG](https://primeng.org/installation).

# Installation
1. Clonez le dépot avec la commande : 
````bash
git clone https://github.com/gofreish/keycloak-rest-ui.git
````
2. Installez les dépendances: 
Placer vous dans le répertoire du projet et exécutez la commande suivante : 
````bash
npm install
````

# Configuration de keycloak
1. Configuration de keycloak
Bien sûr vous devez avoir une installation de keycloak. Si ce n'est pas encore fait allez sur [le site officiel](https://www.keycloak.org/downloads) et choisissez le type d'installation.
Sur la l'interface d'administration de keycloak il faut: 
- Créer un realm;
- Créer un client dans ce realm;
- Créer un utilisateur dans ce realm
- Assigner à ce utilisateur le rôle de **realm-admin** du client **realm-management**.

2. Informations de keycloak
L'essentiel du code du front-end se situe dans le répertoire **app/src/keycloak-ui**.
Définir les informations de keycloak dans le fichier **keycloak-config.ts**
````typescript
	export  const  KEYCLOAK_CONFIG  = {
		url:  '', //URL de keycloak exemple: 'http://localhost:8080'
		realm:  '',//Reaml à utiliser
		clientId:  '',//id du client appartenant au realm
	};
````

# Lancement du projet
Pour lancer l'application utilisez la commande : 
````bash
ng serve
````
La commande lance un serveur de développement accessible à l'adresse `http://localhost:4200`.