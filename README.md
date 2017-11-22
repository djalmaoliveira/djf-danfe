# djf-danfe
[![Build Status](https://travis-ci.org/djalmaoliveira/djf-danfe.svg?branch=master)](https://travis-ci.org/djalmaoliveira/djf-danfe) [![Version](https://img.shields.io/npm/v/djf-danfe.svg)]

Visualizador de DANFE (Documento Auxiliar Da Nota Fiscal Eletrônica) em html.

## Preparação

### Pré-requisitos

NodeJS 8.x

### Instalação

```
npm install djf-danfe
```

### Exemplos

```
const Danfe = require('djf-danfe')
var danfe = Danfe.fromXML('conteudo XML')
console.log(danfe.toHtml())
```

[Outros exemplos de uso](https://github.com/djalmaoliveira/djf-danfe/tree/master/test/index.js)


## Especificações

### Funções

* Criar representação do DANFE em html baseado somente em um arquivo XML existente.
* Criar a representação somente no formato retrato.

### Não oferece

* Conversão para outros formatos como pdf e imagens (basta usar um conversor externo, ex.: [node-wkhtmltopdf](https://github.com/devongovett/node-wkhtmltopdf)).
* Validação dos valores dos campos da NFE.
* (TODO) Contagem do número de folhas.
* (TODO) Geração do código de barras.
* (TODO) Quebra do número de folhas de acordo com a quantidade de itens.
* (TODO) Criar a representação em formato paisagem.

### Arquitetura

* Usa [template engine handlebars](https://github.com/wycats/handlebars.js) para gerar o html.
* Layout baseado no [framework css bulma](https://github.com/jgthms/bulma/).

## Testes

```
npm run test
```

### Codificação

[standardjs](https://standardjs.com/rules.html)


## Contribuições

* Contribuições podem ser enviadas através de pull request.
* Lembre-se de adicionar o teste respectivo a sua implementação.
* [Autores](https://github.com/djalmaoliveira/djf-danfe/contributors)

## Versão

[Semantic Versioning](http://semver.org/)


## Licença

[MIT](LICENSE)
