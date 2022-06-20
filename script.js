var tabuleiro = []

const movimentos = [ [-1, 0], [0, -1], [0, 1], [1, 0] ]

const hp = new Map();

var num_elfs = 0
var num_goblins = 0
var rodadas = 0

const get_tabuleiro = (tabuleiro_string) => {
    var temp = []
    var tabuleiro_array = tabuleiro_string.split("\n")

    if (!/^(#|\.|G|E|\n)+$/.test(tabuleiro_string)) {
        return[]
    }

    if (!/^#+$/.test(tabuleiro_array[0]) || !/^#+$/.test(tabuleiro_array[tabuleiro_array.length - 1])) {
        return []
    }

    for (x in tabuleiro_array) {
        if (!/^#.*#$/.test(tabuleiro_array[x])) {
            return []
        }
    }
    
    for (x in tabuleiro_array) {
        var arr = tabuleiro_array[x].split('')
        temp.push(arr)
    }

    return temp
}


const imprimir_tabuleiro = (tabuleiro) => {
    var board = document.getElementById("board")
    board.innerHTML = ""
    var p = document.createElement("p")
    board.appendChild(p)
    p.innerText = "Rodada: "+rodadas
    var table = document.createElement("table")
    for (x in tabuleiro) {
        var tr = document.createElement("tr")
        table.appendChild(tr)
        for (y in tabuleiro[x]) {
            var td = document.createElement("td")
            if (tabuleiro[x][y] == "G" || tabuleiro[x][y] == "E") {
                td.textContent = tabuleiro[x][y]+"\n"+hp.get(x+"_"+y)
            } else if (tabuleiro[x][y] == ".") {
                td.textContent = ""
            } else if (tabuleiro[x][y] == "#") {
                td.textContent = ""
                td.classList.add('black')
            }
            tr.appendChild(td)
        }
    }
    board.appendChild(table)
}

const rodar = () => {
    var textarea_tabuleiro = document.getElementById("textarea-tabuleiro")

    tabuleiro = get_tabuleiro(textarea_tabuleiro.value)

    if (tabuleiro.length == 0) {
        alert("texto invalido")
        return
    }

    for (x in tabuleiro) {
        for (y in tabuleiro[x]) {
            if (tabuleiro[x][y] == 'E') {
                hp.set(x+"_"+y, 200)
                num_elfs++
            } else if (tabuleiro[x][y] == 'G') {
                hp.set(x+"_"+y, 200)
                num_goblins++
            }
        }
    }

    document.getElementById("start").remove()
    document.getElementById("jogo").style.display = 'block';


    imprimir_tabuleiro(tabuleiro)
    

}

const rodada = () => {

    if (num_elfs == 0 || num_goblins == 0) {
        document.getElementById("botoes").remove()

        if (num_elfs == 0) {
            campeao = "Goblins"
        } else {
            campeao = "Elfs"
        }
        
        const hp_iterator = hp.values();
        
        total_hp = 0
        let i = 0;
        while (i < hp.size) {
            total_hp += hp_iterator.next().value
            i++;
        }

        var txt = `Combat ends after `+rodadas+` full rounds
`+campeao+` win with `+total_hp+` total hit points left
Outcome: `+rodadas+` * `+total_hp+` = `+rodadas*total_hp
        var p = document.createElement("p")
        p.innerText = txt
        document.getElementById("jogo").appendChild(p)

        return
    }

    rodadas++
    ordem_jogadores = []

    for (x in tabuleiro) {
        for (y in tabuleiro[x]) {
            if (tabuleiro[x][y] == 'E' || tabuleiro[x][y] == 'G') {
                ordem_jogadores.push([x, y])
            }
        }
    }
    
    for (j in ordem_jogadores) {
        var tipo_jogador = tabuleiro[ordem_jogadores[j][0]][ordem_jogadores[j][1]]

        if (tipo_jogador == "G" && num_elfs == 0) {
            rodadas--
            break
        } else if (tipo_jogador == "E" && num_goblins == 0) {
            rodadas--
            break
        }

        tabuleiro_jogador = []
    
        for (x in tabuleiro) {
            tabuleiro_jogador.push([])
            for (y in tabuleiro[x]) {
                tabuleiro_jogador[x].push(tabuleiro[x][y])
            }
        }

        var inimigo_proximo = false

        for (m in movimentos) {
            vizinho = [parseInt(ordem_jogadores[j][0])+movimentos[m][0], parseInt(ordem_jogadores[j][1])+movimentos[m][1]]
            if (((tabuleiro[vizinho[0]][vizinho[1]] == 'E' || tabuleiro[vizinho[0]][vizinho[1]] == 'G') && tabuleiro[vizinho[0]][vizinho[1]] != tipo_jogador)) {
                inimigo_proximo = true
                break
            }
        }

        if (!inimigo_proximo) {

            for (x in tabuleiro_jogador) {
                for (y in tabuleiro_jogador[x]) {
                    if ((tabuleiro_jogador[x][y] == 'E' || tabuleiro_jogador[x][y] == 'G') && tabuleiro_jogador[x][y] != tipo_jogador) {
                        for (m in movimentos) {
                            if (tabuleiro_jogador[parseInt(x)+movimentos[m][0]][parseInt(y)+movimentos[m][1]] == '.') {
                                tabuleiro_jogador[parseInt(x)+movimentos[m][0]][parseInt(y)+movimentos[m][1]] = '?'
                            }
                        } 
                    }
                }
            }
        
            const marked = new Set();
            const anterior = new Map();
            marked.add(parseInt(ordem_jogadores[j][0])+'_'+parseInt(ordem_jogadores[j][1]))
            var nodos_para_visitar = [[parseInt(ordem_jogadores[j][0]),parseInt(ordem_jogadores[j][1])]]
            var destino = []
            var destino_encontrado = false
            
            while (nodos_para_visitar.length > 0) {
        
                nodo_atual = nodos_para_visitar.shift()
                
                for (m in movimentos) {
                    vizinho = [parseInt(nodo_atual[0])+movimentos[m][0], parseInt(nodo_atual[1])+movimentos[m][1]]
                    if (!marked.has(vizinho[0]+'_'+vizinho[1])) {
                        marked.add(vizinho[0]+'_'+vizinho[1])
                        anterior.set(vizinho, nodo_atual);
                        if (tabuleiro_jogador[vizinho[0]][vizinho[1]] == '.') {
                            nodos_para_visitar.push(vizinho)
                        } else if (tabuleiro_jogador[vizinho[0]][vizinho[1]] == '?') {
                            destino = vizinho
                            destino_encontrado = true
                        }
                    }
                    if (destino_encontrado) {
                        break
                    }
                }
                if (destino_encontrado) {
                    break
                }
            }
            
            if (destino.length > 0) {
                var prox = destino
                while (anterior.get(prox)[0]+'_'+anterior.get(prox)[1] != parseInt(ordem_jogadores[j][0])+'_'+parseInt(ordem_jogadores[j][1])) {
                    prox = anterior.get(prox)
                }
            
                tabuleiro[prox[0]][prox[1]] = tipo_jogador
                pos_atual = [prox[0], prox[1]]
                hp.set(prox[0]+"_"+prox[1], hp.get(ordem_jogadores[j][0]+"_"+ordem_jogadores[j][1]))
                hp.delete(ordem_jogadores[j][0]+"_"+ordem_jogadores[j][1])
                tabuleiro[ordem_jogadores[j][0]][ordem_jogadores[j][1]] = '.'
            } else {
                pos_atual = [ordem_jogadores[j][0], ordem_jogadores[j][1]] 
            }
        } else {
            pos_atual = [ordem_jogadores[j][0], ordem_jogadores[j][1]] 
        }
        

        for (m in movimentos) {
            vizinho = [parseInt(pos_atual[0])+movimentos[m][0], parseInt(pos_atual[1])+movimentos[m][1]]
            if (((tabuleiro[vizinho[0]][vizinho[1]] == 'E' || tabuleiro[vizinho[0]][vizinho[1]] == 'G') && tabuleiro[vizinho[0]][vizinho[1]] != tipo_jogador)) {
                hp.set(vizinho[0]+"_"+vizinho[1], hp.get(vizinho[0]+"_"+vizinho[1])-3)
                if (hp.get(vizinho[0]+"_"+vizinho[1]) <= 0) {
                    ordem_jogadores = ordem_jogadores.filter((v, i, a) => v != vizinho)
                    if (tabuleiro[vizinho[0]][vizinho[1]] == 'E') {
                        num_elfs--
                    } else if (tabuleiro[vizinho[0]][vizinho[1]] == 'G') {
                        num_goblins--
                    }
                    hp.delete(vizinho[0]+"_"+vizinho[1])
                    tabuleiro[vizinho[0]][vizinho[1]] = "."
                }
                break
            }
        }
    
    }

    imprimir_tabuleiro(tabuleiro)
}

const rodar_ate_terminar = () => {
    while (num_elfs > 0 && num_goblins > 0) {
       rodada()
    }
    rodada()
}



// rodar()