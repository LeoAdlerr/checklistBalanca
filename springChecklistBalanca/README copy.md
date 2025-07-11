# ARQUITETURA


springChecklistBalanca/
├── pom.xml                                   # Configuração do Maven
├── src/
└── main/
│    └── java/
│        └── com/
│            └── uaga/
│                └── checklist/
│                    ├── controller/
│                    ├── dto/
│                    │   └── response/
│                    │       ├── ChecklistResponseDto.java
│                    │       └── ErrorResponseDto.java  
│                    ├── entity/
│                    ├── exception/                     <-- NOVO PACOTE
│                    │   └── GlobalExceptionHandler.java  <-- AQUI
│                    ├── repository/
│                    └── service/
└── test/
│      └── java/
│           └── com/
│               └── uaga/
│                   └── checklist/
│                       └── ... (Testes)



checklist-frontend/
├── node_modules/
├── public/
│   ├── favicon.ico
│   └── index.html
├── src/
│   ├── assets/
│   │   ├── logos/
│   │   │   └── logo.svg
│   │   └── styles/
│   │       └── main.css
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppButton.vue
│   │   │   └── AppModal.vue
│   │   └── checklist/
│   │       ├── ChecklistForm.vue
│   │       ├── ChecklistItem.vue
│   │       └── ChecklistHeader.vue
│   │
│   ├── router/
│   │   └── index.ts
│   │
│   ├── services/
│   │   └── api.ts
│   │
│   ├── store/
│   │   └── checklist.ts
│   │
│   ├── types/
│   │   ├── index.ts
│   │   └── checklist.ts
│   │
│   ├── utils/
│   │   └── formatters.ts
│   │
│   ├── views/
│   │   ├── ChecklistDetailView.vue
│   │   ├── ChecklistListView.vue
│   │   └── HomeView.vue
│   │
│   ├── App.vue
│   └── main.ts
│
├── tests/
│   ├── unit/
│   │   ├── components/
│   │   │   └── ChecklistForm.spec.ts
│   │   └── store/
│   │       └── checklist.spec.ts
│   └── e2e/
│       └── checklist.spec.ts
│
├── .gitignore
├── babel.config.js
├── cypress.json
├── package.json
├── README.md
├── tailwind.config.js
└── tsconfig.json