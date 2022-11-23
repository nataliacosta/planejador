// lidar com upload de json
function onChange(event) {
    var reader = new FileReader();
    reader.onload = onReaderLoad;
    reader.readAsText(event.target.files[0]);
}

function onReaderLoad(event){
    localStorage.setItem("data", event.target.result);
    location.reload();
}

document.getElementById('file2').addEventListener('change', onChange);
document.getElementById('upload').addEventListener('click', (e) => { document.getElementById('file2').click() });

//inicio
var data = JSON.parse(localStorage["data"] ?? "[]");
if (data.length == 0) {
    document.getElementById("tituloPlan").innerText = "Planejador";
    $("#conteudo").addClass("d-none");
    $("#nodata").removeClass("d-none");
} else {
    var titulo = data.titulo;
    var projetos = data.projetos;
    var equipes = data.equipes;
    var complexidades = data.complexidades;
    
    document.getElementById("tituloPlan").innerText = "Planejamento " + titulo;

    var groups = new vis.DataSet();
    // adding groups
    groups.add(equipes);

    // create items
    var items = new vis.DataSet();

    var projPendHTML = "";
    projetos.forEach((p) => {
        projPendHTML += "<div class='col-3 mt-2'><div class='d-flex flex-column border border-success rounded p-3 h-100'>";
        projPendHTML += '<h5 class="text-center w-100 text-success mt-2" style="word-break: break;"><strong>' + p.titulo + '</strong></h5>';
        projPendHTML += '<div class="row">';
        projPendHTML += '<div class="col-md-6">';
        projPendHTML += '<p class="text-center text-success" style="word-break: break; font-size: 10pt;">' + p.SO + '</p>';
        projPendHTML += '</div>';
        projPendHTML += '<div class="col-md-6">';
        projPendHTML += '<p class="text-center text-success" style="word-break: break; font-size: 10pt;">Complexidade ' + p.complexidade + '</p>';
        projPendHTML += '</div>';
        projPendHTML += '<div class="col-md-12">';
        projPendHTML += '<p class="text-success" style="word-break: break; font-size: 10pt;"><strong>Descrição: </strong>'+ p.desc +'</p>';
        projPendHTML += '</div>';
        projPendHTML += '<div class="col-md-12">';
        projPendHTML += '<p class="text-success" style="word-break: break; font-size: 10pt;"><strong>Etapas</strong></p>';
        projPendHTML += '</div>';
        projPendHTML += '<ul class="col-md-12 text-success items" id="' + p.id + '">';
        var temItem = false;
        p.etapas.forEach((etapa) => {
            var titulo = complexidades.find((e) => { return e.grupo == etapa.complexidade}).duracao.find((e2) => { return e2.grupo == etapa.grupo}).nome;
            if (etapa.group == "") {
                projPendHTML += "<li id='" 
                                + p.id 
                                + "_" 
                                + etapa.grupo 
                                + "' draggable='true' class='item' style='word-wrap: break-word;'>" 
                                + titulo + "<br><span class='small'> Complexidade: " 
                                + p.complexidade 
                                + "</span>"
                                + "</li>";
                temItem = true;
            } else {
                items.add({
                    id: p.id + "_" + etapa.grupo,
                    group: etapa.group,
                    start: etapa.inicio,
                    end: etapa.fim,
                    content: p.titulo + "<br>" + titulo + "<br><span class='small'>Complexidade: " + p.complexidade + "</span>",
                });
            }
        });

        if (!temItem) {
            projPendHTML += "<span id='empty'>Não há grupos disponíveis.</span>"
        }
        projPendHTML += "</ul></div></div></div>";
    });
    $("#projPend").html(projPendHTML);

    // specify options
    var options = {
        stack: true,
        start: new Date(2023, 0, 1),
        end: new Date(2024, 0, 1),
        zoomMin: 1000 * 60 * 60 * 60 * 4,
        zoomMax: 1000 * 60 * 60 * 60 * 60 * 2.5,
        editable: true,
        orientation: 'top',
        editable: true,
        onRemove: (item, callback) => {
            var conteudos = item.content.split("<br>");
            var itemHTML = "<li id='" 
                + item.id
                + "' draggable='true' class='item' style='word-wrap: break-word;'>" 
                + conteudos[1] + "<br>" 
                + conteudos[2]
                + "</span>"
                + "</li>";

            var etapa = projetos.filter((a) => { return a.id == item.id.split("_")[0] })[0].etapas.filter((b) => { return b.grupo == item.id.split("_")[1] })[0];
            etapa.group = "";
            etapa.inicio = "";
            etapa.fim = "";

            $('#' + item.id.split("_")[0]).children('span').remove();
            $('#' + item.id.split("_")[0]).append(itemHTML);
            addListen();
            callback(item);
            var remover = [];
            custosItems.forEach((e, i) => {
                if (e.id == item.id) {
                    remover.push(i);
                }
            });
            remover.reverse().forEach((i) => {
                custosItems.splice(i,1);
            });
            calcCustos();
        },
        onAdd: (item, callback) => {
            if (item.content !== "new item" ) {
                callback(item);
            }
            handleItemChange(null, item);
        }
    };

    // create a Timeline
    var container = document.getElementById('mytimeline');
    var timeline1 = new vis.Timeline(container, items, groups, options);

    function handleDragStart(event) {
        var dragSrcEl = event.target;
        var proj = $(projetos).filter((i,n) =>{
            return n.id==((event.target.id).split("_")[0]);
        })[0];

        event.dataTransfer.effectAllowed = 'move';
        var itemType = "range";
        var item = {
            id: event.target.id,
            type: itemType,
            content: proj.titulo + "<br>" + event.target.innerHTML
        };
        // set event.target ID with item ID
        event.target.id = item.id;
        event.dataTransfer.setData("text", JSON.stringify(item));

        // Trigger on from the new item dragged when this item drag is finish
        event.target.addEventListener('dragend', handleDragEnd.bind(this), false);
        
    }
    
    // ACERTA DURAÇÃO E EXCLUI LINHA AO DRAG END E EXCLUI ITEM
    function handleDragEnd(event) {
        var idProjeto = event.target.id.split("_")[0];
        $(event.srcElement).remove();

        if ($("#" + idProjeto)[0].children.length == 0) {
            $("#" + idProjeto).append("<span id='empty'>Não há tarefas disponíveis.</span>");
        }

        var grupo = event.target.id.split("_")[1];
        var projeto = projetos.filter((i) => {
            return (i.id==idProjeto);
        })[0];

        //altera em projetos
        var etapa = projeto.etapas.filter((i3) => { return i3.grupo==grupo })[0];
        etapa.group = timeline1.itemSet.items[event.target.id].data.group;
        etapa.inicio = timeline1.itemSet.items[event.target.id].data.start;
        etapa.fim = timeline1.itemSet.items[event.target.id].data.end;
        
        calcCustos();
    }

    // ACERTA DURAÇÃO AO ITEM
    function handleItemChange(e, obj) {
        var idProjeto = (obj.items ? obj.items[0].split("_")[0] : obj.id.split("_")[0]);
        var grupo = (obj.items ? obj.items[0].split("_")[1] : obj.id.split("_")[1]);
        var projeto = projetos.filter((n) => {
            return (n.id==idProjeto);
        })[0];
        var tempoDev = complexidades.filter((i2) => { return i2.id==projeto.complexidade})[0].duracao.find((i3) => { return i3.grupo == grupo })["tempo"];
        var inicio = new Date(timeline1.itemSet.items[obj.items ?? obj.id].data.start);
        var fim = new Date(inicio);
        fim.setDate(inicio.getDate() + tempoDev);
        timeline1.itemSet.items[obj.items ?? obj.id].data.end = fim;

        //altera em projetos
        var etapa = projeto.etapas.filter((i3) => { return i3.grupo==grupo })[0];
        etapa.group = timeline1.itemSet.items[obj.items ?? obj.id].data.group;
        etapa.inicio = timeline1.itemSet.items[obj.items ?? obj.id].data.start;
        etapa.fim = timeline1.itemSet.items[obj.items ?? obj.id].data.end;

        calcCustos();
    }

    // início custos
    var custosItems = [];

    function getConcorrentes(mes, group) {
        return custosItems.filter((e) => {
            return (e.mes == mes && e.group == group);
        });
    }

    function calcCustos() {
        custosItems = [];
        var items = Object.values(timeline1.itemSet.items).sort((a,b) => (new Date(a.data.start) > new Date(b.data.start)) ? 1 : ((new Date(b.data.start) > new Date(a.data.start)) ? -1 : 0));
        var idProjeto = "";
        var idGrupo = "";
        var quantMeses = 0;
        var custProj = {};
        var custForn = {};
        items.forEach((item) => {
            idProjeto = item.id.split("_")[0];
            idGrupo = item.id.split("_")[1];
            var inicio = new Date(item.data.start);
            var fim = new Date(item.data.end);
            var custItem = {};
            for (var date = new Date(inicio.getFullYear(), inicio.getMonth(), 1); date < fim; date.setMonth(date.getMonth()+1)) {
                var dataInicio = (date < inicio ? inicio : date);
                var dataFim = (date.getMonth() == fim.getMonth() && date.getFullYear() == fim.getFullYear() ? fim : new Date(date.getFullYear(), date.getMonth()+1, 0));
                var concorrentes = getConcorrentes(date.getFullYear().toString() + ("0" + (date.getMonth() + 1)).slice(-2).toString(),item.data.group);
                if (concorrentes.length == 0) {
                    var equipe = equipes.find((e) => { return e.id==item.data.group; });
                    custItem = {
                        id: item.id,
                        group: item.data.group,
                        mes: date.getFullYear().toString() + ("0" + (date.getMonth() + 1)).slice(-2).toString(),
                        quantDias: (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24),
                        custo: equipe.valor_mensal,
                    };
                } else {
                    var totalDias = concorrentes.reduce((a, o) => { return a + o.quantDias },0) + (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24);
                    var valMensal = equipes.find((e) => { return e.id == item.data.group }).valor_mensal;
                    concorrentes.forEach((e) => {
                        e.custo = valMensal / totalDias * e.quantDias;
                    });
                    custItem = {
                        id: item.id,
                        group: item.data.group,
                        mes: date.getFullYear().toString() + ("0" + (date.getMonth() + 1)).slice(-2).toString(),
                        quantDias: (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24),
                        custo: valMensal / totalDias * (dataFim.getTime() - dataInicio.getTime()) / (1000 * 3600 * 24)
                    };
                }
                custosItems.push(custItem);
                var forn = equipes.filter((e => { return e.id == item.data.group }))[0].fornecedor;
                custProj[idProjeto] = custProj[idProjeto] ?? [];
                custProj[idProjeto].push(custItem);
                custForn[forn] = custForn[forn] ?? [];
                custForn[forn].push(custItem);
            }
        });


        //plota custo total
        var custoTotal = custosItems.reduce((a, o) => { return a + o.custo },0);
        $("#custo").html(custoTotal.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }));

        //plota detalhes custo
        var custoProjHTML = "<h6>Por projeto</h6>";
        for (var proj in custProj) {
            var nomeProj = projetos.find((e) => { return e.id == proj }).titulo;
            var totalCost = custProj[proj].reduce((sum, cust) => {
                return sum + cust.custo;
            },0);
            custoProjHTML += "<div class='d-flex'>";
            custoProjHTML += "<div class='col-7'>" + nomeProj + "</div>";
            custoProjHTML += "<div class='col-4 text-end'>" + totalCost.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }) + "</div>";
            custoProjHTML += "</div>";
        }
        $("#custoPorProjeto").html(custoProjHTML);

        var custoFornHTML = "<h6>Por fornecedor</h6>";
        for (var forn in custForn) {
            var totalCost = custForn[forn].reduce((sum, cust) => {
                return sum + cust.custo;
            },0);
            custoFornHTML += "<div class='d-flex'>";
                custoFornHTML += "<div class='col-7'>" + forn + "</div>";
                custoFornHTML += "<div class='col-5 text-end'>" + totalCost.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            }) + "</div>";
            custoFornHTML += "</div>";
        }
        $("#custoPorFornecedor").html(custoFornHTML);

        if (Object.keys(custProj).length == 0) {
            $("#custoPorProjeto").html("Não há projetos planejados.");
            $("#custoPorFornecedor").empty();
        }
    }
    calcCustos();

    //detalhes custos

    //ADD EVENT LISTENS
    function addListen() {
        var items2 = document.querySelectorAll('.items .item');

        for (var i = 0; i < items2.length; i++) {
            items2[i].addEventListener('dragstart', handleDragStart.bind(this), false);
        }
    
        items.on('update', (event, props) => {
            handleItemChange(event, props);
        });
    }
    addListen();
    
    //download
    window.fazDownload = () => {
        const obj = {
            "titulo": titulo,
            "projetos": projetos,
            "equipes": equipes,
            "complexidades": complexidades
        };

        const text = JSON.stringify(obj, null, "\t");
        const name = "data.json";
        const type = "text/plain";

        const a = document.createElement("a");
        const file = new Blob([text], { type: type });
        a.href = URL.createObjectURL(file);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    $("#download").attr("onclick", "fazDownload()");
    
    //upload
    window.fazUpload = () => {
        const obj = {
            "titulo": titulo,
            "projetos": projetos,
            "equipes": equipes,
            "complexidades": complexidades
        };

        const text = JSON.stringify(obj, null, "\t");
        const name = "data.json";
        const type = "text/plain";

        const a = document.createElement("a");
        const file = new Blob([text], { type: type });
        a.href = URL.createObjectURL(file);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        a.remove();
    }

    $("#download").attr("onclick", "fazDownload()");

    //salvar
    window.salvar = () => {
        const obj = {
            "titulo": titulo,
            "projetos": projetos,
            "equipes": equipes,
            "complexidades": complexidades
        };
        const text = JSON.stringify(obj, null, "\t");
        localStorage.setItem("data", text);
    }

    $("#salvar").attr("onclick", "salvar()");
}