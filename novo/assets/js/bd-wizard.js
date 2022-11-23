//Wizard Init
var indexInicial = (localStorage["passoAtual"] ? parseInt(localStorage["passoAtual"]) : 0);


$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "none",
    titleTemplate: '#title#',
    startIndex: indexInicial,
    transitionEffect: 1,
    labels: {
        previous: "Voltar",
        next: "Avançar",
        finish: "Finalizar",
        loading: "Carregando ..."
    },
    onStepChanging: function (e, i, ni) {
        localStorage["passoAtual"] = ni;
        switch (i) {
            case 0: {
                if (input !== undefined && input.files.length == 0) {
                    alert("Nenhum documento importado.");
                    localStorage["passoAtual"] = i;
                    return false;
                }
                if (document.getElementById("tituloPlan").value == "") {
                    alert("Insira o título do planejamento.");
                    localStorage["passoAtual"] = i;
                    return false;
                }
                var data = JSON.parse(localStorage["dataProv"] ?? "{}");
                if (Object.keys(data).length > 0) {
                    localStorage["planejamento"] = data.titulo;
                    localStorage["projetos"] = JSON.stringify(data.projetos);
                    localStorage["equipes"] = JSON.stringify(data.equipes);
                    localStorage["complexidades"] = JSON.stringify(data.complexidades);
                    var gr = [];
                    data.complexidades.forEach((e) => {
                        e.duracao.forEach((d) => {
                            if (gr.indexOf(d.nome) == -1) {
                                gr.push(d.nome);
                            }
                        })
                    });
                    if (gr.length > 0) {
                        localStorage["grupos"] = JSON.stringify(gr);
                    }
                }
                salvaNomePlanejamento();
                break;
            };
            case 1: {
                if (!localStorage["grupos"] && ni > 1) {
                    alert("Nenhuma etapa adicionada.");
                    localStorage["passoAtual"] = i;
                    return false;
                }
                break;
            };
            case 2: {
                var diasEmBranco = Array.prototype.slice.call(document.getElementsByName("dias[]"), 0).filter((e) => (e.value == "" || e.value == "0"));
                if (diasEmBranco.length > 0 && ni > 2) {
                    alert("Alguma das durações de complexidade não foi preenchida ou foi preenchida com 0.");
                    localStorage["passoAtual"] = i;
                    return false;
                }
                salvaComplexidades();
                break;
            };
            case 3: {
                if ((!localStorage["equipes"] || localStorage["equipes"] == "[]") && ni > 3) {
                    alert("Nenhuma equipe adicionada.");
                    localStorage["passoAtual"] = i;
                    return false;
                }
                break;
            };
        }
        switch (ni) {
            case 1: {
                loadGrupos();
                return true;
            };
            case 2: {
                atualizaComplexidades();
                atualizaProjetos();
                return true;
            };
            case 3: {
                loadEquipes();
                return true;
            };
            case 4: {
                loadProjetos();
                return true;
            };
            default: { return true; }            
        }
    },
    onFinishing: function (e, i) {
        if (!localStorage["projetos"] || localStorage["projetos"] == "[]") {
            alert("Nenhum projeto adicionado.");
            return false;
        }
        var data = {
            titulo: localStorage["planejamento"],
            equipes: JSON.parse(localStorage["equipes"]),
            complexidades: JSON.parse(localStorage["complexidades"]),
            projetos: JSON.parse(localStorage["projetos"]),
        };
        localStorage.clear();
        localStorage["data"] = JSON.stringify(data);
        window.location.href = "../";
        return true;
    }
});

//Criar projeto

document.getElementById("tituloPlan").value = localStorage["planejamento"] ?? "";

function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

function onReaderLoad(event){
    localStorage["dataProv"] = event.target.result;
    document.getElementById("tituloPlan").value = JSON.parse(localStorage["dataProv"]).titulo;
}
var input;
function fileUpload() {
    input = document.createElement("input");
    $(input).attr("type", "file");
    $(input).attr("id", "uploadFile");
    input.addEventListener('change', onChange);
    input.click();
}

function salvaNomePlanejamento() {
    localStorage["planejamento"] = document.getElementById("tituloPlan").value;
}

//Etapas
var grupos = JSON.parse(localStorage["grupos"] ?? "[]");
var gruposDiv = document.getElementById("grupos");
function loadGrupos() {
    grupos = JSON.parse(localStorage["grupos"] ?? "[]");
    gruposDiv = document.getElementById("grupos");
    if (grupos.length > 0) {
        var html = "";
        grupos.forEach((e, i) => {
            html += '<div class="form-group col-md-4 border-0" name="grupo" style="cursor: pointer;" listener="false" id="grupo_' + i + '">';
            html += '<div class="d-flex align-items-center border border-success rounded" style="min-height: 50px">';
            html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + e + '</h6>';
            html += '</div>';
            html += '</div>';
        });
    } else {
        html = '<div class="form-group col-md-12 border-0"> Não há etapas incluídas.</div>';
    }
    gruposDiv.innerHTML = html;
}

function excGrupo(el) {
    var exc = confirm("Deseja excluir o grupo?");
    if (exc) {
        grupos = JSON.parse(localStorage["grupos"]);
        grupos.splice(grupos.indexOf(el.target.outerText), 1);
        var elemento = el.target;
        do {
            elemento = elemento.parentNode;
        } while (!elemento.id || (elemento.id && !elemento.id.includes("grupo_")));
        var id = elemento.id.replace("grupo_", "");
        var index = grupos.indexOf(grupos.find((p) => { return p["id"] == id }));
        equipes.splice(index ,1);
        localStorage["grupos"] = JSON.stringify(grupos);
        document.getElementById("grupo_" + id).remove();
    }
}

document.getElementsByName("grupo").forEach((e => {
    e.addEventListener("click", excGrupo);
}));

var btnGrp = document.getElementById("btnGrp");
btnGrp.addEventListener('click', function (e) {
    var nomeGrupo = document.getElementById("nomeGrupo").value;
    if (nomeGrupo == "") {
        alert("Insira um nome para o grupo.");
    } else {
        grupos = JSON.parse(localStorage["grupos"] ?? "[]");
        var gruposDiv = document.getElementById("grupos");
        var html = "";
        html += '<div class="form-group col-md-4 border-0" name="grupo" style="cursor: pointer;" listener="false" id="grupo_' + grupos.length + '">';
        html += '<div class="d-flex align-items-center border border-success rounded" style="min-height: 50px">';
        html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + nomeGrupo + '</h6>';
        html += '</div>';
        html += '</div>';
        var el = document.createElement("div");
        el.innerHTML = html;
        if (gruposDiv.children[0] && gruposDiv.children[0].children.length == 0) {
            gruposDiv.innerHTML = "";
        }
        gruposDiv.append(el.firstChild);
        document.getElementById("nomeGrupo").value = "";
        document.getElementsByName("grupo").forEach((e => {
            if (e.getAttribute("listener") == "false") {
                e.addEventListener("click", excGrupo);
            }
        }));
        grupos.push(nomeGrupo);
        localStorage["grupos"] = JSON.stringify(grupos);
    }
});

//Complexidades
var tiposComp = ["baixa", "media", "alta", "altissima"];
atualizaComplexidades();

function atualizaComplexidades() {
    var tbodyComplexidades = document.getElementById("tbodyComplexidades");
    var grupos = JSON.parse(localStorage["grupos"] ?? "[]");
    if (grupos.length > 0) {
        var html = "";
        grupos.forEach((e, i) => {
            var complexidades = JSON.parse(localStorage["complexidades"] ?? "[]");
            html += '<tr class="text-center"><td class="align-middle">' + e + '</td>';
            tiposComp.forEach((e2) => {
                var compGrupo = complexidades.find((com) => { return com.id == e2 });
                if (compGrupo) {
                    var comp = compGrupo.duracao.find((d) => { return d.grupo == i });
                    if (comp) {
                        html += '<td><input type="number" id="' + e2 + '_' + i + '" placeholder="" name="dias[]" class="form-control" value="' + comp.tempo + '" /> dias corridos</td>';
                    } else {
                        html += '<td><input type="number" id="' + e2 + '_' + i + '" placeholder="" name="dias[]" class="form-control" value="" /> dias corridos</td>';
                    }
                } else {
                    html += '<td><input type="number" id="' + e2 + '_' + i + '" placeholder="" name="dias[]" class="form-control" value="" /> dias corridos</td>';
                }
            });
        });
        tbodyComplexidades.innerHTML = html;
    } else {
        tbodyComplexidades.innerHTML = "<tr class='text-center'><td colspan='5' class='align-middle'>Não há etapas incluídas.</td></tr>";
    }
}

function salvaComplexidades() {
    var complexidades = [];
    grupos = JSON.parse(localStorage["grupos"] ?? "[]");

    tiposComp.forEach((e, i) => {
        var duracoes = [];
        for (var ind = 0; ind < grupos.length; ind++) {
            duracoes.push({
                grupo: ind,
                nome: grupos[ind],
                tempo: document.getElementById(e + "_" + ind).valueAsNumber
            });
        }
        complexidades.push({
            id: e,
            duracao: duracoes
        });
    });

    localStorage.setItem("complexidades", JSON.stringify(complexidades));
}

//Equipes
var equipes = JSON.parse(localStorage["equipes"] ?? "[]");
var equipesDiv = document.getElementById("equipes");
function loadEquipes() {
    equipes = JSON.parse(localStorage["equipes"] ?? "[]");
    equipesDiv = document.getElementById("equipes");
    if (equipes.length > 0) {
        var html = "";
        equipes.forEach((e) => {
            html += '<div class="form-group col-md-4 border-0" id="equipe_' + e.id + '" name="equipe" style="cursor: pointer;" listener="false">';
            html += '<div class="d-flex flex-column align-items-center border border-success rounded" style="min-height: 50px">';
            html += '<h5 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + e.content + '</h5>';
            html += '<p class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + e.fornecedor + '</p>';
            html += '<p class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + e.valor_mensal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}) + '</p>';
            html += '</div>';
            html += '</div>';
        });
    } else {
        html = '<div class="form-group col-md-12 border-0">Não há equipes incluídas.</div>';
    }
    equipesDiv.innerHTML = html;
}

function excEquipe(el) {
    var exc = confirm("Deseja excluir a equipe?");
    if (exc) {
        equipes = JSON.parse(localStorage["equipes"] ?? "[]");
        var elemento = el.target;
        do {
            elemento = elemento.parentNode;
        } while (!elemento.id.includes("equipe_"));
        var id = elemento.id.replace("equipe_", "");
        var index = equipes.indexOf(equipes.find((p) => { return p["id"] == id }));
        document.getElementById("equipe_" + id).remove();
        equipes.splice(index ,1);
        localStorage["equipes"] = JSON.stringify(equipes);
    }
}

document.getElementsByName("equipe").forEach((e => {
    if (e.getAttribute("listener") == "false") {
        e.addEventListener("click", excEquipe);
        e.setAttribute("listener", "true");
    }
}));

var btnEqp = document.getElementById("btnEqp");
btnEqp.addEventListener('click', function (e) {
    var equipe = document.getElementById("equipeProv").value;
    var fornecedor = document.getElementById("fornecedorProv").value;
    var valor = (Number.isNaN(document.getElementById("valorProv").valueAsNumber) ? 0 : document.getElementById("valorProv").valueAsNumber);
    if (equipe == "" || fornecedor == "") {
        alert("Insira um valor para os campos equipe e fornecedor.");
    } else {
        var equipes = JSON.parse(localStorage["equipes"] ?? "[]");
        equipes.push({
            id: equipes.length,
            content: equipe,
            fornecedor,
            valor_mensal: valor
        });
        localStorage["equipes"] = JSON.stringify(equipes);
        var equipesDiv = document.getElementById("equipes");
        var html = "";
        html += '<div class="form-group col-md-4 border-0" id="equipe_' + (equipes.length-1) + '" name="equipe" style="cursor: pointer;" listener="false">';
        html += '<div class="d-flex flex-column align-items-center border border-success rounded" style="min-height: 50px">';
        html += '<h5 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + equipe + '</h5>';
        html += '<p class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + fornecedor + '</p>';
        html += '<p class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL'}) + '</p>';
        html += '</div>';
        html += '</div>';
        var el = document.createElement("div");
        el.innerHTML = html;
        if (equipesDiv.children[0] && equipesDiv.children[0].children.length == 0) {
            equipesDiv.innerHTML = "";
        }
        equipesDiv.append(el.firstChild);
        document.getElementById("equipeProv").value = "";
        document.getElementById("fornecedorProv").value = "";
        document.getElementById("valorProv").value = "";
        document.getElementsByName("equipe").forEach((e => {
            if (e.getAttribute("listener") == "false") {
                e.addEventListener("click", excEquipe);
                e.setAttribute("listener", "true");
            }
        }));
    }
});

//Projetos
var projetos = JSON.parse(localStorage["projetos"] ?? "[]");
var projetosDiv = document.getElementById("projetos");
function loadProjetos() {
    projetos = JSON.parse(localStorage["projetos"] ?? "[]");
    projetosDiv = document.getElementById("projetos");
    if (projetos.length > 0) {
        var html = "";
        projetos.forEach((e) => {
            var etapasPrj = "";
            e.etapas.forEach((etapa) => {
                var etp = JSON.parse(localStorage["grupos"])[etapa.grupo];
                if (etp) {
                    etapasPrj += etp + ", ";
                }
            });
            if (etapasPrj == "") {
                etapasPrj = "Não há etapas nesse projeto, ";
            }
            etapasPrj += "|";
            etapasPrj = etapasPrj.replace(", |", "");
            var SO = (e.SO == "" || e.SO == undefined ? "Sem SO cadastrada" : e.SO);
            var desc = (e.desc == "" || e.desc == undefined ? "Sem descrição cadastrada" : e.desc);
            html += `
            <div class="form-group col-md-6 border-0" id="projeto_` + e.id + `" name="projeto" style="cursor: pointer;" listener="false">
                <div class="d-flex flex-column align-items-center border border-success rounded p-1" style="min-height: 50px">
                <h5 class="text-center w-100 text-success mt-2" style="word-break: break;"><strong>` + e.titulo + `</strong></h5>
                <div class="row w-100">
                    <div class="col-md-6">
                        <p class="text-center text-success" style="word-break: break; font-size: 10pt;">` + SO + `</p>
                    </div>
                    <div class="col-md-6">
                        <p class="text-center text-success" style="word-break: break; font-size: 10pt;">Complexidade ` + e.complexidade + `</p>
                    </div>
                    <div class="col-md-12">
                        <p class="text-success" style="word-break: break; font-size: 10pt;"><strong>Descrição: </strong>`+ desc +`</p>
                    </div>
                    <div class="col-md-12">
                        <p class="text-success" style="word-break: break; font-size: 10pt;"><strong>Etapas: </strong>` + etapasPrj + `</p>
                    </div>
                </div>
                </div>
            </div>`;
    
        });
        document.getElementsByName("projeto").forEach((e => {
            if (e.getAttribute("listener") == "false") {
                e.addEventListener("click", excProj);
                e.setAttribute("listener", "true");
            }
        }));
    } else {
        html = '<div class="form-group col-md-12 border-0">Não há projetos incluídos.</div>';
    }
    projetosDiv.innerHTML = html;
}

function excProj(el) {
    var exc = confirm("Deseja excluir o projeto?");
    if (exc) {
        projetos = JSON.parse(localStorage["projetos"] ?? "[]");
        var elemento = el.target;
        do {
            elemento = elemento.parentNode;
        } while (!elemento.id.includes("projeto_"));
        var id = elemento.id.replace("projeto_", "");
        var index = projetos.indexOf(projetos.find((p) => { return p["id"] == id }));
        document.getElementById("projeto_" + id).remove();
        projetos.splice(index ,1);
        localStorage["projetos"] = JSON.stringify(projetos);
    }
}

atualizaProjetos();
function atualizaProjetos() {
    var compProv = document.getElementById("compProv");
    var html = '<option value="" name="complex" disabled selected>Complexidade</option>';
    tiposComp.forEach((e) => {
        html += '<option value="' + e + '" name="complex">' + e + '</option>';
    });
    compProv.innerHTML = html;
    
    var etapasProjProv = document.getElementById("etapasProjProv");
    var html = "";
    var etapas = JSON.parse(localStorage["grupos"] ?? "[]");
    etapas.forEach((e, i) => {
        html += `
        <div class="form-check col-md-4">
            <label class="form-check-label">
                <input type="checkbox" class="form-check-input" name="etapasProj" value="` + i + `" >` + e + `</label>
        </div>`;
    });
    etapasProjProv.innerHTML = html;
    
}

var btnPrj = document.getElementById("btnPrj");
btnPrj.addEventListener('click', function (e) {
    var nomeProjeto = document.getElementById("projetoProv").value;
    var SO = document.getElementById("soProv").value;
    var complexidade = document.getElementById("compProv").value;
    var descricao = document.getElementById("descProv").value;
    var etapas = JSON.parse(localStorage["grupos"] ?? "[]");
    var etapasSelecionadas = Array.prototype.slice.call(document.getElementsByName("etapasProj")).filter((e2) => { return e2.checked });
    var html = "";
    if (nomeProjeto == "" || SO == "" || complexidade == "" || descricao == "" || etapasSelecionadas.length == 0) {
        alert("Insira um valor para todos os campos do projeto.");
    } else {
        var projetos = JSON.parse(localStorage["projetos"] ?? "[]");
        var etapasProj = [];
        var strEtapas = "";
        etapasSelecionadas.forEach((etapa) => {
            strEtapas += etapas[parseInt(etapa.value)] + ", ";
            etapasProj.push({
                grupo: etapa.value,
                group: "",
                inicio: "",
                fim: ""
            });
        });
        if (strEtapas == "") {
            strEtapas = "Não há etapas nesse projeto, "
        }
        strEtapas += "|";
        strEtapas = strEtapas.replace(", |", "");
        projetos.push({
            id: projetos.length,
            titulo: nomeProjeto,
            SO,
            complexidade,
            desc: descricao,
            etapas: etapasProj
        });
        localStorage["projetos"] = JSON.stringify(projetos);
        html += '<div class="form-group col-md-6 border-0" id="projeto_' + projetos.length + '" name="projeto" style="cursor: pointer;" listener="false">';
        html += '<div class="d-flex flex-column align-items-center border border-success rounded p-1" style="min-height: 50px">';
        html += '<h5 class="text-center w-100 text-success mt-2" style="word-break: break;"><strong>' + nomeProjeto + '</strong></h5>';
        html += '<div class="row w-100">';
        html += '<div class="col-md-6">';
        html += '<p class="text-center text-success" style="word-break: break; font-size: 10pt;">' + SO + '</p>';
        html += '</div>';
        html += '<div class="col-md-6">';
        html += '<p class="text-center text-success" style="word-break: break; font-size: 10pt;">Complexidade ' + complexidade + '</p>';
        html += '</div>';
        html += '<div class="col-md-12">';
        html += '<p class="text-success" style="word-break: break; font-size: 10pt;"><strong>Descrição: </strong>'+ descricao +'</p>';
        html += '</div>';
        html += '<div class="col-md-12">';
        html += '<p class="text-success" style="word-break: break; font-size: 10pt;"><strong>Etapas: </strong>' + strEtapas + '</p>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        var el = document.createElement("div");
        el.innerHTML = html;
        if (projetosDiv.children[0] && !projetosDiv.children[0].id) {
            projetosDiv.innerHTML = "";
        }
        projetosDiv.append(el.firstChild);
        document.getElementById("projetoProv").value = "";
        document.getElementById("soProv").value = "";
        document.getElementById("compProv").value = "";
        document.getElementById("descProv").value = "";
        document.getElementsByName("etapasProj").forEach((e) => {
            e.checked = false;
        });
        document.getElementsByName("projeto").forEach((e) => {
            if (e.getAttribute("listener") == "false") {
                e.addEventListener("click", excProj);
                e.setAttribute("listener", "true");
            }
        });
    }
});