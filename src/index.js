const handlebars = require('handlebars')
const NFe = require('djf-nfe')
const TEMPLATE_DANFE = __dirname + '/template-danfe.hbs'
const fs = require('fs')
const path = require('path')

/**
 * Retorna <valor> especificado com máscara do CPF.
 *
 * @param      {string}  valor
 * @return     {string}
 */
function mascaraCPF (valor) {
  var retorno
  var grupo01 = valor.substring(0, 3)
  retorno = grupo01
  var grupo02 = valor.substring(3, 6)
  if (grupo02 !== '') {
    retorno += '.' + grupo02
  }
  var grupo03 = valor.substring(6, 9)
  if (grupo03 !== '') {
    retorno += '.' + grupo03
  }
  var grupo04 = valor.substring(9)
  if (grupo04 !== '') {
    retorno += '-' + grupo04
  }
  return retorno
}

/**
 * Retorna <valor> especificado com máscara do CNPJ.
 *
 * @param      {string}  valor
 * @return     {string}
 */
function mascaraCNPJ (valor) {
  var retorno
  var grupo01 = valor.substring(0, 2)
  retorno = grupo01
  var grupo02 = valor.substring(2, 5)
  if (grupo02 !== '') {
    retorno += '.' + grupo02
  }
  var grupo03 = valor.substring(5, 8)
  if (grupo03 !== '') {
    retorno += '.' + grupo03
  }
  var grupo04 = valor.substring(8, 12)
  if (grupo04 !== '') {
    retorno += '/' + grupo04
  }
  var grupo05 = valor.substring(12)
  if (grupo05 !== '') {
    retorno += '-' + grupo05
  }
  return retorno
}

/**
 * Retorna <numero> especificado formatado de acordo com seu tipo (cpf ou cnpj).
 *
 * @param      {string}  numero
 * @return     {string}
 */
function formataInscricaoNacional (numero) {
  if (numero) {
    if (numero.length === 11) {
      return mascaraCPF(numero)
    }
    if (numero.length === 14) {
      return mascaraCNPJ(numero)
    }
  }
  return numero
}

/**
 * Formata data de acordo com <dt> esoecificado.
 * <dt> é no formato UTC, YYYY-MM-DDThh:mm:ssTZD (https://www.w3.org/TR/NOTE-datetime)
 *
 * @param      {string}  dt
 * @return     {string}
 */
function formataData (dt) {
  dt = dt ? dt.toString() : ''
  if (!dt) { return '' }

  if (dt && dt.length === 10) {
    dt += 'T00:00:00+00:00'
  }

  var [data, hora] = dt.split('T')
  var [hora, utc] = hora.split(/[-+]/)
  var [ano, mes, dia] = data.split('-')
  var [hora, min, seg] = hora.split(':')
  var [utchora, utcmin] = utc ? utc.split(':') : ['', '']
  return dia.padStart(2, '0') + '/' + mes.toString().padStart(2, '0') + '/' + ano
}

function formataHora (dt) {
  if (dt) {
    var data = new Date(dt)
    return data.getHours().toString().padStart(2, '0') + ':' + (data.getMinutes().toString().padStart(2, '0')) + ':' + data.getSeconds().toString().padStart(2, '0')
  }
  return ''
}

/**
 * Retorna o valor formatado em moeda de acordo com  <numero>  e <decimais> especificados.
 *
 * @param      {number}   numero
 * @param      {number}  decimais
 * @return     {string}
 */
function formataMoeda (numero, decimais) {
  decimais = decimais || 4
  var symbol = ''
  var decimal = ','
  var thousand = '.'
  var negative = numero < 0 ? '-' : ''
  var i = parseInt(numero = Math.abs(+numero || 0).toFixed(decimais), 10) + ''
  var j = 0

  decimais = !isNaN(decimais = Math.abs(decimais)) ? decimais : 2
  symbol = symbol !== undefined ? symbol : '$'
  thousand = thousand || ','
  decimal = decimal || '.'
  j = (j = i.length) > 3 ? j % 3 : 0
  return symbol + negative + (j ? i.substr(0, j) + thousand : '') + i.substr(j).replace(/(\d{3})(?=\d)/g, '$1' + thousand) + (decimais ? decimal + Math.abs(numero - i).toFixed(decimais).slice(2) : '')
};

/**
 * Retorna objeto representando os dados da <entidade> especificada.
 *
 * @param      {Object}  entidade  djf-nfe
 * @return     {Object}
 */
function dadosEntidade (entidade) {
  if (entidade) {
    return {
      nome: entidade.nome(),
      fantasia: entidade.fantasia(),
      ie: entidade.inscricaoEstadual(),
      ie_st: entidade.inscricaoEstadualST(),
      inscricao_municipal: entidade.inscricaoMunicipal(),
      inscricao_nacional: formataInscricaoNacional(entidade.inscricaoNacional()),
      telefone: entidade.telefone()
    }
  }
  return {}
}

/**
 * Retorna objeto representando os dados do <endereco> especificado.
 *
 * @param      {Object}  endereco   djf-nfe
 * @return     {Object}
 */
function endereco (endereco) {
  if (endereco) {
    return {
      endereco: endereco.logradouro(),
      numero: endereco.numero(),
      complemento: endereco.complemento(),
      bairro: endereco.bairro(),
      municipio: endereco.municipio(),
      cep: endereco.cep(),
      uf: endereco.uf()
    }
  }
  return {}
}

/**
 * Retorna a <cahve> da NFE formata.
 * Formatação: grupos de 4 números separados por espaço.
 * @param      {string}  chave
 * @return     {string}
 */
function formataChave (chave) {
  var out = ''
  if (chave && chave.length === 44) {
    for (var i = 0; i < chave.split('').length; i++) {
      if (i % 4 === 0) {
        out += ' ' + chave.charAt(i)
      } else {
        out += chave.charAt(i)
      }
    }
    return out
  }
  return chave
}

/**
 * Retorna array de objetos com os dados dos itens de acordo com <nfe> especificado.
 *
 * @param      {<object>}  nfe     djf-nfe
 * @return     {array}
 */
function itens (nfe) {
  var itens = []
  var nrItens = nfe.nrItens()
  for (var i = 1; i <= nrItens; i++) {
    var row = nfe.item(i)
    var item = {
      codigo: row.codigo(),
      descricao: row.descricao(),
      ncm: row.ncm(),
      cst: row.origem() + '' + row.cst(),
      cfop: row.cfop(),
      unidade: row.unidadeComercial(),
      quantidade: formataMoeda(row.quantidadeComercial()),
      valor: formataMoeda(row.valorUnitario()),
      desconto: formataMoeda(row.valorDesconto()),
      total: formataMoeda(row.valorProdutos()),
      base_calculo: formataMoeda(row.baseCalculoIcms()),
      icms: formataMoeda(row.valorIcms()),
      ipi: formataMoeda(row.valorIPI()),
      porcentagem_icms: formataMoeda(row.porcetagemIcms(), 2),
      porcentagem_ipi: formataMoeda(row.porcentagemIPI(), 2)
    }
    itens.push(item)
  }

  return itens
}

/**
 * Retorna array de objetos com os dados das duplicatas de acordo com <nfe> especificado
 *
 * @param      {object}  nfe     djf-nfe
 * @return     {array}
 */
function duplicatas (nfe) {
  var dups = []
  if (nfe.cobranca() && nfe.cobranca().nrDuplicatas() > 0) {
    var quant = nfe.cobranca().nrDuplicatas()
    for (var i = 1; i <= quant; i++) {
      var dup = nfe.cobranca().duplicata(i)
      dups.push({
        numero: dup.numeroDuplicata(),
        vencimento: formataData(dup.vencimentoDuplicata()),
        valor: formataMoeda(dup.valorDuplicata(), 2)
      })
    }
  }

  return dups
}

/**
 * Retorna os dados da observação de acordo com <nfe> especificado.
 *
 * @param      {object}  nfe     djf-nfe
 * @return     {string}
 */
function observacoes (nfe) {
  var quant = nfe.nrObservacoes()
  var result = ''
  for (var i = 1; i <= quant; i++) {
    result += '\n' + nfe.observacao(i).texto()
  }

  return result
}

/**
 * Retorna o template html do Danfe preenchido com os dados em <data> especificado.
 * Retorna vazio se não gerado.
 * @param      {object}  data
 * @return     {string}
 */
function renderHtml (data) {
  if (!data) {
    return ''
  }
  var template = fs.readFileSync(TEMPLATE_DANFE, 'utf8')
  return handlebars.compile(template)(data)
}

/**
 * Retorna objeto com os dados do template de acordo com <nfe> especificado.
 *
 * @param      {object}  nfe     djf-nfe
 * @return     {object}
 */
function getTemplateData (nfe) {
  if (!nfe) {
    return null
  }

  var data = {
    operacao: nfe.tipoOperacao(),
    natureza: nfe.naturezaOperacao(),
    numero: nfe.nrNota(),
    serie: nfe.serie(),
    chave: formataChave(nfe.chave()),
    protocolo: nfe.protocolo(),
    data_protocolo: formataData(nfe.dataHoraRecebimento()) + ' ' + formataHora(nfe.dataHoraRecebimento()),
    destinatario: Object.assign(dadosEntidade(nfe.destinatario()), endereco(nfe.destinatario())),
    emitente: Object.assign(dadosEntidade(nfe.emitente()), endereco(nfe.emitente())),
    data_emissao: formataData(nfe.dataEmissao()),
    data_saida: formataData(nfe.dataEntradaSaida()),
    base_calculo_icms: formataMoeda(nfe.total().baseCalculoIcms(), 2),
    imposto_icms: formataMoeda(nfe.total().valorIcms(), 2),
    base_calculo_icms_st: formataMoeda(nfe.total().baseCalculoIcmsST(), 2),
    imposto_icms_st: formataMoeda(nfe.total().valorIcmsST(), 2),
    imposto_tributos: formataMoeda(nfe.total().valorTotalTributos(), 2),
    total_produtos: formataMoeda(nfe.total().valorProdutos(), 2),
    total_frete: formataMoeda(nfe.total().valorFrete(), 2),
    total_seguro: formataMoeda(nfe.total().valorSeguro(), 2),
    total_desconto: formataMoeda(nfe.total().valorDesconto(), 2),
    total_despesas: formataMoeda(nfe.total().valorOutrasDespesas(), 2),
    total_ipi: formataMoeda(nfe.total().valorIPI(), 2),
    total_nota: formataMoeda(nfe.total().valorNota(), 2),
    transportador: Object.assign(dadosEntidade(nfe.transportador()), endereco(nfe.transportador())),
    informacoes_fisco: nfe.informacoesFisco(),
    informacoes_complementares: nfe.informacoesComplementares(),
    observacao: observacoes(nfe),
    modalidade_frete: nfe.modalidadeFrete(),
    modalidade_frete_texto: nfe.modalidadeFreteTexto(),
    itens: itens(nfe),
    duplicatas: duplicatas(nfe)
  }

  if (nfe.transporte().volume()) {
    let volume = nfe.transporte().volume()
    data.volume_quantidade = formataMoeda(volume.quantidadeVolumes())
    data.volume_especie = volume.especie()
    data.volume_marca = volume.marca()
    data.volume_numeracao = volume.numeracao()
    data.volume_pesoBruto = formataMoeda(volume.pesoBruto())
    data.volume_pesoLiquido = formataMoeda(volume.pesoLiquido())
  }

  if (nfe.transporte().veiculo()) {
    data.veiculo_placa = nfe.transporte().veiculo().placa()
    data.veiculo_placa_uf = nfe.transporte().veiculo().uf()
    data.veiculo_antt = nfe.transporte().veiculo().antt()
  }

  if (nfe.servico()) {
    data.total_servico = formataMoeda(nfe.servico().valorTotalServicoNaoIncidente())
    data.total_issqn = formataMoeda(nfe.servico().valorTotalISS())
    data.base_calculo_issqn = formataMoeda(nfe.servico().baseCalculo())
  }

  return data
}

/**
 * Retorna modelo Danfe de acordo com objeto <nfe> especificado.
 *
 * @param      {<type>}  nfe     djf-nfe
 * @return     {Object}  { description_of_the_return_value }
 */
function model (nfe) {
  return {
    toHtml: () => renderHtml(getTemplateData(nfe))
  }
}

/**
 * Retorna modelo Danfe de acordo com objeto  <nfe> especificado.
 *
 * @param      {object}  nfe    djf-nfe
 * @return     {<object>}
 */
module.exports.fromNFe = function (nfe) {
  if (!nfe || typeof nfe.nrNota !== 'function') {
    return model(null)
  }
  return model(nfe)
}

/**
 * Retorna modelo Danfe de acordo com <xml> especificado.
 *
 * @param      {string}  xml
 * @return     {<object>}
 */
module.exports.fromXML = function (xml) {
  if (!xml || typeof xml !== 'string') {
    return model(null)
  }
  return model(NFe(xml))
}

/**
 * Retorna modelo Danfe de acordo com <filePath> especificado.
 *
 * @param      {string}  filePath
 * @return     {<object>}
 */
module.exports.fromFile = function (filePath) {
  var content = ''

  if (!filePath || typeof filePath !== 'string') {
    return model(null)
  }

  try {
    content = fs.readFileSync(filePath, 'utf8')
  } catch (err) {
    throw new Error('File not found: ' + filePath + ' => ' + err.message)
  }

  return module.exports.fromXML(content)
}
