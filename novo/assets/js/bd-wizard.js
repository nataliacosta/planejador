//Wizard Init

$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "none",
    titleTemplate: '#title#',
    startIndex: 4,
    transitionEffect: 1,
    onStepChanging: function (e, i, ni) {
        switch (i) {
            case 0: {
                if (input !== undefined && input.files.length == 0) {
                    alert("Nenhum documento importado.");
                    return false;
                }
                if (document.getElementById("titulo").value == "") {
                    alert("Insira o título do projeto.");
                    return false;
                }
                return true;
            };
            case 1: {
                if (!localStorage["grupos"]) {
                    alert("Nenhum grupo adicionado.");
                    return false;
                }
                atualizaComplexidades();
                //atualizaProjetos();
                return true;
            };
            case 2: {
                var diasEmBranco = Array.prototype.slice.call(document.getElementsByName("dias[]"), 0).filter((e) => (e.value == "" || e.value == "0"));
                if (diasEmBranco.length > 0) {
                    alert("Alguma(s) das durações de complexidade não foi preenchida ou foi preenchida com 0.");
                    return false;
                }
                salvaComplexidades();
                return true;
            };
            case 3: {
                if (!localStorage["equipes"] || localStorage["equipes"] == "[]") {
                    alert("Nenhuma equipe adicionada.");
                    return false;
                }
                return true;
            };
            default: {
                return true;
            };
        
        }
    },
    onFinishing: function (e, i) {
        if (!localStorage["projetos"] || localStorage["projetos"] == "[]") {
            alert("Nenhum projeto adicionado.");
            return false;
        }
        return true;
    }
});


//Criar projeto
$("#uploadDiv").click(fileUpload);


function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

function onReaderLoad(event){
    localStorage.setItem("dataProv", event.target.result);
    document.getElementById("titulo").setAttribute("value", JSON.parse(localStorage.getItem("dataProv")).titulo);
}
var input;
function fileUpload() {
    input = document.createElement("input");
    $(input).attr("type", "file");
    $(input).attr("id", "uploadFile");
    input.addEventListener('change', onChange);
    input.click();
}

//Grupos
if (localStorage["grupos"] != null) {
    var grupos = JSON.parse(localStorage["grupos"]);
    var gruposDiv = document.getElementById("grupos");
    var html = "";
    grupos.forEach((e) => {
        html += '<div class="form-group col-md-4 border-0" name="grupo" style="cursor: pointer;" listener="true">';
        html += '<div class="d-flex align-items-center border border-success rounded" style="min-height: 50px">';
        html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + e + '</h6>';
        html += '</div>';
        html += '</div>';
    });
    gruposDiv.innerHTML = html;
}

function excGrupo(el) {
    var exc = confirm("Deseja excluir o grupo?");
    if (exc) {
        var grupos = JSON.parse(localStorage["grupos"]);
        grupos.splice(grupos.indexOf(el.target.outerText), 1);
        localStorage["grupos"] = JSON.stringify(grupos);
        if (el.target.parentNode.parentNode.className.includes("row")) {
            el.target.parentNode.remove();
        } else {
            el.target.parentNode.parentNode.remove();
        }
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
        var grupos = JSON.parse(localStorage["grupos"] ?? "[]");
        grupos.push(nomeGrupo);
        localStorage["grupos"] = JSON.stringify(grupos);
        var gruposDiv = document.getElementById("grupos");
        var html = "";
        html += '<div class="form-group col-md-4 border-0" name="grupo" style="cursor: pointer;" listener="false">';
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
    }
});

//Complexidades
var tiposComp = ["baixa", "media", "alta", "altissima"];
atualizaComplexidades();

function atualizaComplexidades() {
    var tbodyComplexidades = document.getElementById("tbodyComplexidades");
    var grupos = JSON.parse(localStorage["grupos"] ?? []);
    if (grupos.length > 0) {
        var html = "";
        grupos.forEach((e, i) => {
            var complexidades = JSON.parse(localStorage["complexidades"] ?? "[]");
            html += '<tr class="text-center"><td class="align-middle">' + e + '</td>';
            tiposComp.forEach((e2) => {
                var compGrupo = complexidades.find((com) => { return com.id == e2 });
                if (compGrupo) {
                    var comp = compGrupo.duracao.find((d) => { return d.grupo == e });
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
        tbodyComplexidades.innerHTML = "<tr class='text-center'><td colspan='5' class='align-middle'>Não há grupos incluídos.</td></tr>";
    }
}

function salvaComplexidades() {
    var complexidades = [];
    var grupos = JSON.parse(localStorage["grupos"]);

    tiposComp.forEach((e, i) => {
        var duracoes = [];
        for (var ind = 0; ind < grupos.length - 1; ind++) {
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
equipesDiv.innerHTML = html;

document.getElementsByName("equipe").forEach((e => {
    if (e.getAttribute("listener") == "false") {
        e.addEventListener("click", function (el) {
            var exc = confirm("Deseja excluir a equipe?");
            if (exc) {
                equipes = JSON.parse(localStorage["equipes"] ?? "[]");
                var id = "";
                if (el.target.parentNode.parentNode.className.includes("row")) {
                    id = el.target.parentNode.id.split("_")[1];
                } else {
                    id = el.target.parentNode.parentNode.id.split("_")[1];
                }
                equipes.splice(id ,1);
                localStorage["equipes"] = JSON.stringify(equipes);
                document.getElementById("equipe_" + id).remove();
            }
        });
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
                e.addEventListener("click", function (el) {
                    var exc = confirm("Deseja excluir a equipe?");
                    if (exc) {
                        equipes = JSON.parse(localStorage["equipes"] ?? "[]");
                        var id = "";
                        if (el.target.parentNode.parentNode.className.includes("row")) {
                            id = el.target.parentNode.id.split("_")[1];
                        } else {
                            id = el.target.parentNode.parentNode.id.split("_")[1];
                        }
                        equipes.splice(id ,1);
                        localStorage["equipes"] = JSON.stringify(equipes);
                        document.getElementById("equipe_" + id).remove();
                    }
                });
                e.setAttribute("listener", "true");
            }
        }));
    }
});

//Projetos
var projetos = JSON.parse(localStorage["projetos"] ?? "[]");
var projetosDiv = document.getElementById("projetos");
var html = "";
projetos.forEach((e) => {
    var etapasPrj = "";
    e.etapas.forEach((etapa) => {
        var etp = JSON.parse(localStorage["grupos"])[etapa.grupo];
        if (etp) {
            etapasPrj += etp + ", ";
        }
    });
    etapasPrj += "|";
    if (etapasPrj == "") {
        etapasPrj = "Não há etapas nesse projeto"
    }
    etapasPrj = etapasPrj.replace(", |", "");
    var SO = (e.SO == "" || e.so == undefined ? "Sem SO cadastrada" : e.SO);
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
projetosDiv.innerHTML = html;

document.getElementsByName("projeto").forEach((e => {
    if (e.getAttribute("listener") == "false") {
        e.addEventListener("click", function (el) {
            var exc = confirm("Deseja excluir o projeto?");
            if (exc) {
                projetos = JSON.parse(localStorage["projetos"] ?? "[]");
                var id = "";
                if (el.target.parentNode.parentNode.className.includes("row")) {
                    id = el.target.parentNode.id.split("_")[1];
                } else if (el.target.parentNode.parentNode.parentNode.className.includes("row")) {
                    id = el.target.parentNode.parentNode.id.split("_")[1];
                } else {
                    id = el.target.parentNode.parentNode.parentNode.id.split("_")[1];
                }
                var index = projetos.indexOf(projetos.find((p) => { return p["id"] == id }));
                projetos.splice(index,1);
                document.getElementById("projeto_" + id).remove();
                localStorage["projetos"] = JSON.stringify(projetos);
            }
        });
        e.setAttribute("listener", "true");
    }
}));

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

/*
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
                e.addEventListener("click", function (el) {
                    var exc = confirm("Deseja excluir a equipe?");
                    if (exc) {
                        equipes = JSON.parse(localStorage["equipes"] ?? "[]");
                        var id = "";
                        if (el.target.parentNode.parentNode.className.includes("row")) {
                            id = el.target.parentNode.id.split("_")[1];
                        } else {
                            id = el.target.parentNode.parentNode.id.split("_")[1];
                        }
                        equipes.splice(id ,1);
                        localStorage["equipes"] = JSON.stringify(equipes);
                        document.getElementById("equipe_" + id).remove();
                    }
                });
                e.setAttribute("listener", "true");
            }
        }));
    }
});
*/
//Form control

$('#firstName').on('change', function(e) {
    $('#enteredFirstName').text(e.target.value || 'Cha');
});

$('#lastName').on('change', function(e) {
    $('#enteredLastName').text(e.target.value || 'Ji-Hun C');
});

$('#phoneNumber').on('change', function(e) {
    $('#enteredPhoneNumber').text(e.target.value || '+230-582-6609');
});

$('#emailAddress').on('change', function(e) {
    $('#enteredEmailAddress').text(e.target.value || 'willms_abby@gmail.com');
});

$('#designation').on('change', function(e) {
    $('#enteredDesignation').text(e.target.value || 'Junior Developer');
});

$('#department').on('change', function(e) {
    $('#enteredDepartment').text(e.target.value || 'UI Development');
});

$('#employeeNumber').on('change', function(e) {
    $('#enteredEmployeeNumber').text(e.target.value || 'JDUI36849');
});

$('#workEmailAddress').on('change', function(e) {
    $('#enteredWorkEmailAddress').text(e.target.value || 'willms_abby@company.com');
});

