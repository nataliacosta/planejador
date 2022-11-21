//Wizard Init

$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "none",
    titleTemplate: '#title#',
    startIndex: 2,
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
                return true;
            };
            case 2: {
                var diasEmBranco = Array.prototype.slice.call(document.getElementsByName("dias[]"), 0).filter((e) => (e.value == "" || e.value == "0"));
                console.log(diasEmBranco);
                if (diasEmBranco.length > 0) {
                    alert("Alguma(s) das durações de complexidade não foi preenchida ou foi preenchida com 0.");
                    return false;
                }
                salvaComplexidades();
                return true;
            };
            default: {
                return true;
            };
        }
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
    var nomesGrupo = localStorage["grupos"].split("|");
    var grupos = document.getElementById("grupos");
    var html = "";
    nomesGrupo.forEach((e, i) => {
        if (i < nomesGrupo.length - 1) {
            html += '<div class="form-group col-md-4 border-0" name="grupo" style="cursor: pointer;" listener="true">';
            html += '<div class="d-flex align-items-center border border-success rounded" style="min-height: 50px">';
            html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + nomesGrupo[i] + '</h6>';
            html += '</div>';
            html += '</div>';
        }
    });
    grupos.innerHTML = html;
}

document.getElementsByName("grupo").forEach((e => {
    e.addEventListener("click", function (el) {
        var exc = confirm("Deseja excluir o grupo?");
        if (exc) {
            localStorage["grupos"] = localStorage["grupos"].replace(el.target.outerText + "|", "");
            if (el.target.parentNode.parentNode.className.includes("row")) {
                el.target.parentNode.remove();
            } else {
                el.target.parentNode.parentNode.remove();
            }
        }
    });
}));

var btnGrp = document.getElementById("btnGrp");
btnGrp.addEventListener('click', function (e) {
    var nomeGrupo = document.getElementById("nomeGrupo").value;
    if (nomeGrupo == "") {
        alert("Insira um nome para o grupo.");
    } else {
        if (localStorage["grupos"]) {
            localStorage["grupos"] += nomeGrupo + "|";
        } else {
            localStorage["grupos"] = nomeGrupo + "|";
        }
        var grupos = document.getElementById("grupos");
        var html = "";
        html += '<div class="form-group col-md-4 border-0" name="grupo" style="cursor: pointer;" listener="false">';
        html += '<div class="d-flex align-items-center border border-success rounded" style="min-height: 50px">';
        html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + nomeGrupo + '</h6>';
        html += '</div>';
        html += '</div>';
        var el = document.createElement("div");
        el.innerHTML = html;
        if (grupos.children[0] && grupos.children[0].children.length == 0) {
            grupos.innerHTML = "";
        }
        grupos.append(el.firstChild);
        document.getElementById("nomeGrupo").value = "";
        document.getElementsByName("grupo").forEach((e => {
            if (e.getAttribute("listener") == "false") {
                e.addEventListener("click", function (el) {
                    var exc = confirm("Deseja excluir o grupo?");
                    if (exc) {
                        localStorage["grupos"] = localStorage["grupos"].replace(el.target.outerText + "|", "");
                        if (el.target.parentNode.parentNode.className.includes("row")) {
                            el.target.parentNode.remove();
                        } else {
                            el.target.parentNode.parentNode.remove();
                        }
                    }
                });
                e.setAttribute("listener", "true");
            }
        }));
    }
});

//Complexidades
var tiposComp = ["baixa", "media", "alta", "altissima"];
atualizaComplexidades();

function atualizaComplexidades() {
    var tbodyComplexidades = document.getElementById("tbodyComplexidades");
    if (localStorage["grupos"] != null && localStorage["grupos"] != "") {
        var nomesGrupo = localStorage["grupos"].split("|");
        var html = "";
        nomesGrupo.forEach((e, i) => {
            if (i < nomesGrupo.length - 1) {
                var values = [];
                var complexidades = (localStorage["complexidades"] ? JSON.parse(localStorage["complexidades"]) : []);
                html += '<tr class="text-center"><td class="align-middle">' + nomesGrupo[i] + '</td>';
                for (var ind = 0; ind < tiposComp.length; ind++) {
                    if (complexidades.length > 0) {
                        values.push(complexidades.filter((com) => { return com.id == tiposComp[ind] })[0].duracao.find((d) => {
                            return d.grupo == i;
                        }).tempo);
                    } else {
                        values.push("");
                    }
                    html += '<td><input type="number" id="' + tiposComp[ind] + '_' + i + '" placeholder="" name="dias[]" class="form-control" value="' + values[ind] + '" /> dias corridos</td>';
                }
            }
        });
        tbodyComplexidades.innerHTML = html;
    } else {
        tbodyComplexidades.innerHTML = "<tr class='text-center'><td colspan='5' class='align-middle'>Não há grupos incluídos.</td></tr>";
    }
}

function salvaComplexidades() {
    var complexidades = [];
    var grupos = localStorage["grupos"].split("|");

    tiposComp.forEach((e, i) => {
        var duracoes = [];
        for (var ind = 0; ind < grupos.length - 1; ind++) {
            console.log(e + "_" + ind);
            duracoes.push({
                grupo: i,
                nome: grupos[i],
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

