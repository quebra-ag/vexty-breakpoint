# Vexty: Briefing Breakpoint e Proposta de Branding

Página única (HTML, CSS e JavaScript estáticos) preparada pela Agência Quebra para a Vexty.
Não há etapa de build: os arquivos são servidos como estão.

## Estrutura

```
index.html          marcação e conteúdo
css/styles.css      estilos (tokens de cor da Quebra no bloco :root)
js/main.js          navegação ativa, canvas da Hero e animações GSAP
assets/             imagens (hero.jpg, cta.jpg, vexty.png, quebra.png, quebra-tag.png)
.nojekyll           faz o GitHub Pages servir os arquivos sem processar com Jekyll
```

## Dependências externas (via CDN)

- GSAP 3.12.5 e ScrollTrigger (cdnjs)
- Google Fonts: Bricolage Grotesque e Hanken Grotesk

Sem JavaScript ou sem acesso ao CDN, todo o conteúdo continua visível; só as animações deixam de rodar.

## Ver localmente

```
python3 -m http.server 8000
```

Depois abra http://localhost:8000.

## Publicar no GitHub Pages

1. Crie o repositório e envie estes arquivos para a branch `main`:
   ```
   git init
   git add .
   git commit -m "Página Vexty: Briefing Breakpoint e Proposta de Branding"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
2. No GitHub: Settings > Pages > Source: "Deploy from a branch", branch `main`, pasta `/ (root)`.

Todos os caminhos são relativos, então a página funciona tanto em `usuario.github.io/repositorio/` quanto em domínio próprio.

## Privacidade

O documento é uma proposta comercial. Um site do GitHub Pages é público para quem tiver o link, mesmo com repositório privado (exceto em planos Enterprise com Pages privado).
O `index.html` traz `noindex, nofollow` para ficar fora dos buscadores, mas isso não restringe o acesso.

## Imagens

As fotos foram exportadas do Figma em 1800 px de largura. Para trocar por versões em resolução maior, mantenha os mesmos nomes de arquivo em `assets/`.
