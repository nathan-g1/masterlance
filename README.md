apter 5: User Manual
5.1 Scope
The manual covers the following:
● Installation & configurations of the system (both backend and frontend)
● How to start the microservices and the frontend web application
● How to post jobs
● How to register to the system and authenticate into the system
● How to top-up one’s wallet balance
5.2 Installation and configuration
The backend system can run/be deployed on any platform a docker environment can run.
Similarly, the front-end application can be operated on a Node.js environment.
The pre-requirements to install the system include:
● docker (for the backend)
● docker-compose (for the backend)
● Static File Server (Nginx, etc..) for production environment or a Node.js environment
with yarn and Vue installed for dev. environment
Installation Guide (backend):
1. Clone the project from the remote Git repository
88
$ git clone https://gitlab.com/masterlanceteam/masterlance.git
Figure 18. Git clone the project(backend)
2. Change directory to the newly cloned folder and run the setup.sh script file in order to
install the required dependencies for the services.
Figure 19. Project setup and package install
3. Run the following command:
to pull the necessary Docker base images and build the system’s service images locally
