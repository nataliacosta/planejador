//Wizard Init

$("#wizard").steps({
    headerTag: "h3",
    bodyTag: "section",
    transitionEffect: "none",
    titleTemplate: '#title#',
    startIndex: 1,
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
            html += '<div class="form-group col-md-4 border-0">';
            html += '<div class="text-uppercase d-flex align-items-center border border-success rounded" style="min-height: 50px">';
            html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + nomesGrupo[i] + '</h6>';
            html += '</div>';
            html += '</div>';
        }
    });
    grupos.innerHTML = html;
}

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
        html += '<div class="form-group col-md-4 border-0">';
        html += '<div class="text-uppercase d-flex align-items-center border border-success rounded" style="min-height: 50px">';
        html += '<h6 class="mb-0 text-center w-100 text-success" style="word-break: break-all;">' + nomeGrupo + '</h6>';
        html += '</div>';
        html += '</div>';
        var el = document.createElement("div");
        el.innerHTML = html;
        console.log(grupos.children[0].children.length);
        if (grupos.children[0].children.length == 0) {
            grupos.innerHTML = "";
        }
        grupos.append(el.firstChild);
    }
    document.getElementById("nomeGrupo").value = "";
});

document.getElementById('nomeGrupo').addEventListener('keyup', function(e) {
    if (!e) e = window.event;
    var keyCode = e.code || e.key;
    if (keyCode == 'Enter'){
      btnGrp.click();
      return false;
    }
});

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

