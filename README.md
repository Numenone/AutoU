# AutoU - Classificador Inteligente de Emails

![AutoU Interface](https://imgur.com/a/pA5GSLk)

## 🚀 Sobre o Projeto

AutoU é uma aplicação web desenvolvida em Python com Flask que utiliza a API do Google Gemini para automatizar a classificação e a resposta de emails. A ferramenta classifica os emails em **Produtivos** (que exigem uma ação) ou **Improdutivos** (que não necessitam de ação imediata) e sugere uma resposta apropriada para cada caso, otimizando o tempo e a eficiência da equipe.

O projeto conta com um sistema completo de autenticação de usuários, um dashboard para visualização de estatísticas de uso e um perfil de usuário onde é possível gerenciar dados pessoais, senha e configurações de SMTP para o envio de emails diretamente da plataforma.

## 🌐 Link da Aplicação

Acesse a aplicação online através do link:
**[https://auto-u-eosin.vercel.app/](https://auto-u-eosin.vercel.app/)**

## ✨ Tecnologias Utilizadas

- **Backend:** Python, Flask, Flask-SQLAlchemy
- **Frontend:** HTML, CSS, JavaScript
- **Banco de Dados:** PostgreSQL (via Supabase)
- **Inteligência Artificial:** Google Gemini
- **Autenticação e Criptografia:** Flask-Login, Werkzeug, Cryptography
- **Deploy:** Vercel

## ⚙️ Como Rodar Localmente

Siga os passos abaixo para executar o projeto em sua máquina local.

### Pré-requisitos

- [Python 3.10+](https://www.python.org/downloads/)
- [Git](https://git-scm.com/downloads)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/Numenone/AutoU.git
    cd AutoU
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    # Windows
    python -m venv venv
    venv\Scripts\activate

    # macOS / Linux
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure as variáveis de ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto e adicione as seguintes variáveis:

    ```env
    # URL de conexão do seu banco de dados PostgreSQL (Ex: do Supabase)
    DATABASE_URL="postgresql://user:password@host:port/dbname"

    # Chave secreta para o Flask (pode ser qualquer string segura)
    SECRET_KEY="sua-chave-secreta-aqui"

    # Sua chave de API do Google Gemini
    GEMINI_API_KEY="sua-chave-gemini-aqui"

    # Chave para criptografar dados sensíveis (gere com o comando abaixo)
    ENCRYPTION_KEY="sua-chave-de-criptografia-aqui"
    ```

    Para gerar a `ENCRYPTION_KEY`, execute o seguinte comando no terminal e copie a saída para o seu arquivo `.env`:
    ```bash
    flask generate-key
    ```

5.  **Inicialize o banco de dados:**
    Este comando criará as tabelas necessárias no banco de dados configurado na `DATABASE_URL`.
    ```bash
    flask init-db
    ```

6.  **Execute a aplicação:**
    ```bash
    flask run
    ```

    A aplicação estará disponível em `http://127.0.0.1:5000`.

## 🌟 Funcionalidades Principais

-   **Autenticação de Usuários:** Sistema seguro de cadastro e login.
-   **Classificação de Emails:** Faça upload de arquivos `.txt`, `.pdf` ou cole o texto do email para classificá-lo como "Produtivo" ou "Improdutivo".
-   **Sugestão de Respostas:** A IA gera uma resposta automática baseada no conteúdo e na categoria do email.
-   **Envio de Email:** Envie a resposta sugerida (ou uma personalizada) diretamente da interface, utilizando as credenciais SMTP do usuário.
-   **Dashboard de Estatísticas:** Gráficos que mostram o volume de emails classificados por mês e dia, além da distribuição entre categorias.
-   **Gerenciamento de Perfil:** Altere seus dados, senha e configure suas credenciais de email (Gmail) de forma segura.
-   **Segurança:** Senhas de SMTP são criptografadas no banco de dados para garantir a segurança das credenciais.
-   **Modo Light/Dark:** Interface com temas claro e escuro para melhor conforto visual.
