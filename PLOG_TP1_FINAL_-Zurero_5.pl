:- use_module(library(lists)).
:- use_module(library(random)).

%---------------------------------------------------------------------------------------------------------------------%
%---------------------------------------ZURERO EM PROLOG--------------------------------------------------------------%
%---------------------------------------------------------------------------------------------------------------------%
%---------TUTORIAL----------------------------------------------------------------------------------------------------%
%--Para começar um jogo insira um dos seguintes comandos: ------------------------------------------------------------%
%-- hvsh. - Para um Jogo de Humano contra Humano. -------------%
%-- pcvspc. - Para um Jogo de Computador contra Computador ----%
%-- hvspc. - Para um Jogo de Humano contra Computador. --------%
%-- pcvsh. - Para um Jogo de Computador contra Humano. --------%
%---------------------------------------------------------------------------------------------------------------------%



%--------- tabuleiro inicial-------------%
newboard([[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]]).




%----------------------------------------------------------------------------------------------------------------------------------%
%----------------------------------------------PLACE-Colocar peça-------------------------------------------------------------------%
%----------------------------------------------------------------------------------------------------------------------------------%


place(J, BI, L, N, BF):-   %J-Jogador   BI-board inicial   L-letra   N-numero  BF-board final%
                              ItN is 19-N,
                              char_code(L, Ch),
                              ItL is Ch-65,
                              place2(J, BI, ItL, ItN, BF).

%funçoes necessarias para o funcionamento de move: place2 e subst%


%Place2 - Escolhe a linha horizontal desejada(N) e chama subst%
place2(_,[], _, _, []).
place2(J,[H|T1], ItL, ItN, [H|T2]):-
                              ItN \=0 ,!,
                              ItN1 is ItN-1,
                              place2(J,T1, ItL, ItN1, T2).
place2(J,[H1|T1], ItL, ItN, [H2|T2]):-
                              subst(J, ItL, H1, H2),
                              ItN1 is ItN-1,
                              place2(J, T1, ItL, ItN1, T2).
                                                    
%Subst -  percorre a linha horizontal(selecionada por place2) e substitui o valor em L(Letra) pelo valor em J(jogador)%
subst(_, _, [], []).
subst(J, ItL, [H|T1], [H|T2]) :-
                              ItL \= 0 , !, 
                              ItL1 is ItL-1,
                              subst(J, ItL1, T1, T2).
subst(J, ItL, [_|T1], [J|T2]) :-
                              ItL1 is ItL-1,
                               subst(J, ItL1, T1, T2).





%----------------------------------------------------------------------------------------------------------------------------------%
%----------------------------------------------Colocar primeira peça---------------------------------------------------------------%
%----------------------------------------------------------------------------------------------------------------------------------%

%primeiro a jogar é sempre o preto, daí o "1"%
first(L, N, BF) :-
                              newboard(BI), 
                              place(1, BI, L, N, BF).



%----------------------------------------------------------------------------------------------------------------------------------%
%----------------------------------------------MOVE-Colocar peças que sucedem a primeira-------------------------------------------%
%----------------------------------------------------------------------------------------------------------------------------------%
%-----passado como iteracoes   se O='up' ou 'down'  It=19-numero   se O='left' ou 'right' It = Letra-A (primeira linha ou coluna, it=0 ---%
move(J, BI, 'Up', It, BF):- 
                              transpose(BI, BI2),
                              moveLeft(J, BI2,  It, BF1),
                              transpose(BF1, BF).
move(J, BI, 'Left', It, BF) :- moveLeft(J, BI,  It, BF).

move(J, BI, 'Right', It, BF) :-  
                              inverterBoardH(BI, BI2),
                              moveLeft(J, BI2,  It, BF1),
                              inverterBoardH(BF1, BF).

move(J, BI, _, It, BF) :- inverterBoardV(BI, BI2T),
                              transpose(BI2T, BI2),
                              moveLeft(J, BI2,  It, BF1),
                              transpose(BF1, BFT),
                              inverterBoardV(BFT, BF).


%-----------funçoes necessarias para funcionamento de move--------------%             
                 
%faz inversao na horizontal do Board%

inverterBoardH([], []).
inverterBoardH([H|T], [H1|T1]):-
                              inverterLinha(H, H1),
                              inverterBoardH(T, T1).
inverterLinha(Lista, InvLista):- rev(Lista, [], InvLista).
rev([H|T],S,R):- rev(T,[H|S],R). 
rev([],R,R). 


%faz inversao na vertical do Board%

inverterBoardV(BI, BF):- transpose(BI, BI2),
                              inverterBoardH(BI2, BI3),
                              transpose(BI3, BF).




%move para inserir peças por cima ou esquerda%

moveLeft(J, BI, It, BF):-
                              check(BI, It), !,  %caso check e true->  placeT, ou seja ha um elemento atras da peça%
                              placeT(J,BI, It, BF).
moveLeft(J, BI, It, BF):-placeF(J,BI, It, BF).



%Place T- pedra deslizante bate contra pedra com outra atras desta%
placeT(J,BI, It, BF):- 
                              linha(BI, It, Linha),
                              find(Linha, 0, Res),
                              N is 19-It,
                              X is 65+Res-1,
                              char_code(L, X),
                              place(J, BI, L, N , BF).




%PlaceF - pedra deslizante bate contra pedra com nada atras dela%
placeF(J,BI, It, BF):- 
                              linha(BI, It, Linha),
                              find(Linha, 0, Res),
                              findEmpurrar(Linha, Res, Jog),  
                              N is 19-It,
                              X is 65+Res+1,
                              char_code(L1, X),
                              place(Jog, BI, L1, N, BF1),
                              X1 is 65+Res,
                              char_code(L, X1),
                              place(J, BF1, L, N , BF).


%encontra a cor da peça que a pedra deslizante embate%
findEmpurrar([H|_], 0, H).
findEmpurrar([_|T], Res, Jog) :- 
                              Res1 is Res-1,
                              findEmpurrar(T, Res1, Jog).

%descobre onde se encontra a pedra em que a pedra deslizante embate%
find([0|T], V, Res) :-
                    V1 is V+1,
                    find(T,V1, Res).
find(_, V, V).


%----------Ve se a seguir ao primeiro elemento encontrado, se encontra outro elemento------------------%
check(BI,  It):-         linha(BI, It, Linha), !,
                              nextElementFull(Linha).

%percorre a linha desejada até chegar ao pimeiro elemento nao 0, e vê o proximo elemento a ver se nao e 0%
% se tem uma peça atras TRUE se nao FALSE%
nextElementFull([0|T]) :-  nextElementFull(T).
nextElementFull([1|[1|_]]) :-  true.
nextElementFull([1|[2|_]]) :- true.
nextElementFull([2|[1|_]]) :- true.
nextElementFull([2|[2|_]]) :- true.
       

%percorre board até a linha desejada e retorna essa linha%
linha([H|_], 0,H).
linha([_|T], It, Res) :-
                              It1 is It-1,
                              linha(T,  It1, Res).









%----------------------------------------------------------------------------------------------------------------------------------%
%----------------------------------------------GAME_OVER : fim do jogo-------------------------------------------------------------%
%----------------------------------------------------------------------------------------------------------------------------------%

game_over(B,W) :- gameOverH(B,W).
game_over(B,W) :- gameOverV(B,W).

gameOverV(B,W) :-
                              transpose(B,B1),
                              gameOverH(B1,W).

gameOverH([H|_], W) :- ignorezeros(H, H2), gameOverLineCheck(H2, 0, 0, W).
gameOverH([_|T], W) :- gameOverH(T, W).

gameOverLineCheck(_, 5, Temp, Temp).
gameOverLineCheck([Temp|T], N,Temp, W):-
                             N1 is N+1,
                             gameOverLineCheck(T,N1,Temp,W).
gameOverLineCheck([H|T],_,_, W):-
                              gameOverLineCheck(T, 1, H, W).
        


%--------------------------------------------------------------------------------------------------------------%
%---------------------------------------Valid Moves -----------------------------------------------------------%
%--------------------------------------------------------------------------------------------------------------%




%validmoves(Board, VetorOrientacao, VetorValores).%
%na implementacao, ao fazer display, nao esquecer transformar os na vertical em letras!!!!%

valid_moves(Board, Orientacao, Valores) :- 
                              validmoveRight(Board, 19, 'Right', O1, V1),
                              inverterBoardH(Board, Board1),
                              validmoveRight(Board1, 19, 'Left', O2, V2),
                              transpose(Board,Board2),
                              validmoveRight(Board2, 19, 'Up', O3, V3T),
                              inverterBoardH(Board2, Board3),
                              turnValuetoLetter(V3T, V3),
                              validmoveRight(Board3, 19, 'Down', O4,V4T),
                              turnValuetoLetter(V4T, V4),
                              append(O1,O2,O),
                              append(O3,O4,Oa),
                              append(O,Oa,Orientacao),
                              append(V1,V2,V),
                              append(V3,V4,Va),
                              append(V,Va,Valores).

turnValuetoLetter([], []).
turnValuetoLetter([H|T], [H2|T2]):- H2T is 84-H, char_code(H2, H2T), turnValuetoLetter(T, T2).

%validmovesRight(Board,It = 19 no inicio,  VetorOrientacao, VetorValores)%
validmoveRight([],_,_, [], []).        
validmoveRight([H|T], It, O, [O|T1], [It|T2]) :- confere(H), !,   It1 is It -1, validmoveRight(T, It1,O, T1, T2).
validmoveRight([_|T], It,O, H1, H2) :-  It1 is It-1,validmoveRight(T, It1,O, H1, H2).
     

confere(H) :- tempeca(H), naoocupado(H), twopieces(H).
%confere se tem uma peça%
tempeca([0|T]) :- tempeca(T).
tempeca([1|_]):- true.
tempeca([2|_]):- true.

%confere se nao esta tudo ocupado, se estiver false%
%se estiver tudo ocupado nao e possivel inserir uma nova peça%
naoocupado([0|_]):-true.
naoocupado([_|T]):- naoocupado(T).

%duas peças no inicio da linha, aí tb nao pode inserir mais uma, nao da para empurrar%
twopieces([1|[1|_]]) :- false.
twopieces([0|[0|_]]):-true.
twopieces([0|[1|_]]):-true.
twopieces([1|[0|_]]):-true.
twopieces([2|[2|_]]):-false.
twopieces([2|[1|_]]):-false.
twopieces([1|[2|_]]):-false.
twopieces([2|[0|_]]):-true.
twopieces([0|[2|_]]):-true.


%----------------------------------------------------------------------------------------------------------------%
%------------------------------------------Value Board ----------------------------------------------------------%
%----------------------------------------------------------------------------------------------------------------%


%value(Board, Player, direcao,It,  Value), num peças repetidas * 10%
value(Board, Player, 'Up', It, Value):- transpose(Board, BoardT),
                              linha(BoardT, It, Line),
                              ignorezeros(Line, Line1),
                              countline(Line1, Player, 0, Value).
value(Board, Player, 'Down', It, Value):-
                               transpose(Board, BoardT),
                               inverterBoardH(BoardT, BoardT1),
                               linha(BoardT1, It, Line),
                               ignorezeros(Line, Line1),
                              countline(Line1, Player, 0, Value).
value(Board, Player, 'Right', It, Value):-
                              inverterBoardH(Board, Board1),
                              linha(Board1, It, Line),
                              ignorezeros(Line, Line1),
                              countline(Line1, Player, 0, Value).
value(Board, Player, _, It, Value):-
                              linha(Board, It, Line),
                              ignorezeros(Line, Line1),
                              countline(Line1, Player, 0, Value).



%ignorar zeros iniciais%
ignorezeros([0|T], B):- ignorezeros(T,B).
ignorezeros([1|T], [1|T]) :- true.
ignorezeros([2|T], [2|T]) :- true.

%conta o numero de valores seguidos%
countline([], _, Temp, Temp).
countline([P|T], P, Temp, Value) :- Temp1 is Temp+1, countline(T, P, Temp1,Value).
countline([H|_], P, Temp, Value) :- H \= P, countline([], P, Temp, Value).




%-----------------------------------------------------------------------------------------------------------------%
%------------------------------Choose move------------------------------------------------------------------------%
%-----------------------------------------------------------------------------------------------------------------%

%choose_move(Board, Jogador, Dificuldade, MoveRes), moveres é um vetor, primeiro elemento é a direcao e segunda é a letra ou numero%

choose_move(Board, _, 'Facil',[Oi, Vi]):- valid_moves(Board, O, V), length(O, L),  random(0, L, R), choose(O, R, Oi), choose(V,R, Vi).
choose_move(Board,Jogador, _, [Ores,Vres]) :- valid_moves(Board, O, V), bestmove(Board, Jogador, O, V, 0,0, 0, Ores, Vres).

                                                                                             
bestmove(_, _,[], [], _ , OTemp, VTemp, OTemp, VTemp).
bestmove(Board, Jogador,['Right'|T], [H1|T1], Temp,_,_, ORes, VRes) :- H2 is 19-H1,value(Board, Jogador, 'Right', H2, Value), Value>=Temp , !, 
                              bestmove(Board, Jogador, T, T1, Value, 'Right', H1, ORes, VRes).
bestmove(Board, Jogador,['Right'|T], [_|T1], Temp, OTemp, VTemp,ORes, VRes) :- bestmove(Board, Jogador, T, T1, Temp, OTemp, VTemp, ORes, VRes).

bestmove(Board, Jogador, ['Left'|T], [H1|T1], Temp, _, _,ORes, VRes) :-  H2 is 19-H1, value(Board, Jogador, 'Left', H2, Value), Value>=Temp , !, 
                              bestmove(Board, Jogador, T, T1, Value, 'Left', H1,ORes, VRes).
bestmove(Board, Jogador,['Left'|T], [_|T1], Temp, OTemp, VTemp,ORes, VRes) :- bestmove(Board, Jogador, T, T1, Temp, OTemp, VTemp, ORes, VRes).

bestmove(Board, Jogador, ['Up'|T], [H1|T1], Temp, _, _,ORes, VRes) :- turnLetterToIterator(H1, HTemp), value(Board, Jogador, 'Up', HTemp, Value), Value>=Temp , !, 
                              bestmove(Board, Jogador, T, T1, Value, 'Up', H1,ORes, VRes).
bestmove(Board, Jogador,['Up'|T], [_|T1], Temp, O, V,ORes, VRes) :- bestmove(Board, Jogador, T, T1, Temp, O, V,ORes, VRes).

bestmove(Board, Jogador, ['Down'|T], [H1|T1], Temp, _, _,ORes, VRes) :- turnLetterToIterator(H1, HTemp), value(Board, Jogador, 'Down', HTemp, Value),  Value>=Temp , !, 
                              bestmove(Board, Jogador, T, T1, Value, 'Down', H1,ORes, VRes).
bestmove(Board, Jogador,['Down'|T], [_|T1], Temp, O, V,ORes, VRes) :- bestmove(Board, Jogador, T, T1, Temp, O, V,ORes, VRes).

turnLetterToIterator(H, H1):- char_code(H, Num) , H1 is Num-65.


%encontra o elemento desejado na linha, R é o iterador aleatorio e choose diz-nos qual o valor que se enconta em Orientacao[i] ou Valores[i])%
choose([H|_], 0, H).
choose([_|T], R, Res):- R1 is R-1, choose(T, R1, Res).


                              
%-----------------------------------------------------------------------------------------------------------------%
%---------------------------------Pedir input ao jogador----------------------------------------------------------%
%-----------------------------------------------------------------------------------------------------------------%


                      
%---pedir a primeira jogada---%
pedir_jogada1(L,N):-
                write('Escolha uma linha (1 a 19)'),
                read(N),
                write('Escolha uma Coluna (A a S)'),
                read(L).


%----pedir qualquer outra jogada------%

%Pergunta de onde vem a peça%
pedir_ori(Ori):-
              write('Escolha de onde vem a peca: Up, Down, Left, Right'),
              read(Ori).

%Escolher os valores mais expecificos conforme de onde vem a peca%
pedir_jogada(It,'Up'):-
               write('Escolha, uma coluna (A a S)'),
               read(X),
               char_code(X,Xc),
               char_code('S',S),
               It is 19-(S-Xc)-1.

pedir_jogada(It,'Down'):-
               write('Escolha, uma coluna (A a S)'),
               read(X),
               char_code(X,Xc),
               char_code('S',S),
               It is 19-(S-Xc)-1.         

pedir_jogada(It,'Left'):-
               write('Escolha, uma linha (1 a 19)'),
               read(X),
               It is 19-X.

pedir_jogada(It,'Right'):-
               write('Escolha, uma linha (1 a 19)'),
               read(X),
               It is 19-X.

%-----------------------------------------------------------------------------------------------------------------%
%----------------------------------------Funçoes auxiliares do PC-------------------------------------------------%
%-----------------------------------------------------------------------------------------------------------------%

%-----primeira jogada de um jogador computador----%
pc_primeira_jogada(L,N) :-
            
                  random(0,19,N),
                  random(0,19,Aux),
                  Aux2 is Aux+65,
                  char_code(L,Aux2).

%---pedido de dificuldade do PC---%
pedir_dificuldade(D):-
                   read(D).


%---Auxiliares da funcao processar em baixo---%
processar2('Up',X,It):-
               [X1|_]=X,
               char_code(X1,Xc),
               It is 19-(83-Xc)-1.

processar2('Down',X,It):-
               [X1|_]=X,
               char_code(X1,Xc),
               It is 19-(83-Xc)-1.
       
processar2('Right',X,It):-
               It is 19-X.

processar2('Left',X,It):-
              It is 19-X.



%---Funçao utilizada para passar os dados da funcao choose_move para a funcao move ---%
processar_jogpc(MoveRes,Ori,It):-     
                     [Ori|X] = MoveRes,
                     processar2(Ori,X,It).
                     

              
                

%-----------------------------------------------------------------------------------------------------------------%
%------------------------------Começar um jogo--------------------------------------------------------------------%
%-----------------------------------------------------------------------------------------------------------------%

%----------------------Começar um Jogo Humano vs Humano-----------------------------------------------------------%        
hvsh :-
      write('Começou um jogo de Humano contra Humano'),
      nl,
      display_game1(1),
      pedir_jogada1(L,N),
      first(L, N, BN),
      display_game(BN,1),
      jogar(BN,2,_).

%--------------------------------PC vs PC-------------------------------------------------------------------------%

pcvspc :- 
      write('Começou um jogo de Computador contra Computador'),
      nl,
      display_game1(1),
      pc_primeira_jogada(L,N),
      write('Qual a dificuldade do primeiro jogador (Facil ou Dificil)?'),
      pedir_dificuldade(Dif1),
      nl,
      write('Qual a dificuldade do segundo Jogador (Facil ou Dificil)?'),
      pedir_dificuldade(Dif2),
      first(L, N, BN),
      display_game(BN,1),
      jogarpcpc(BN,2,_,Dif1,Dif2).

%-------------------------------------Humano vs PC----------------------------------------------------------------%

hvspc :-
      write('Começou um jogo de Humano contra PC'),
      nl,
      display_game1(1),
      write('Qual a dificuldade do Computador (Facil ou Dificil)?'),
      pedir_dificuldade(Dif),
      pedir_jogada1(L,N),
      first(L, N, BN),
      display_game(BN,1),
      jogarhvspc(BN,2,_,Dif).

%-------------------------------------PC vs Humano----------------------------------------------------------------%

pcvsh :-
      write('Começou um jogo de PC vs Humano'),
      nl,
      display_game1(1),
      pc_primeira_jogada(L,N),
      write('Qual a dificuldade do primeiro jogador (Facil ou Dificil)?'),
      pedir_dificuldade(Dif),
      nl,
      first(L, N, BN),
      display_game(BN,1),
      jogarpcvsh(BN,2,_,Dif).

%-------------------------------------------------------------------------------------------------------------------%
%----------------------------------------Trocar Jogador-------------------------------------------------------------%
%-------------------------------------------------------------------------------------------------------------------%

next_player(1,2).
next_player(2,1).


%-------------------------------------------------------------------------------------------------------------------%
%--------------------------------------------Jogada-----------------------------------------------------------------%
%-------------------------------------------------------------------------------------------------------------------%

%--Jogada do jogador Humano--%
jogada(BI,J,BF):-
          write('Jogador '),
          write(J),
          write(' e voce a jogar'), 
          nl,
          pedir_ori(Ori),
          pedir_jogada(It,Ori),
          move(J, BI, Ori, It, BF).

%---Jogada do Computador---%
jogadapc(BI,J,BF,Dif):-
          write('Jogador '),
          write(J),
          write(' e voce a jogar'), 
          nl,
          choose_move(BI,J, Dif, MoveRes),
          processar_jogpc(MoveRes,Ori,It),
          move(J, BI, Ori, It, BF).


%-------------------------------------------------------------------------------------------------------------------%
%---------------------------Jogar-----------------------------------------------------------------------------------%
%-------------------------------------------------------------------------------------------------------------------%

%----------------------Humano vs Humano-----------------------------------------------------------------------------%
jogar(BI,1,_):- game_over(BI,1),!,write('Fim de Jogo'), nl, write('Parabens Jogador 1').
jogar(BI,2,_):- game_over(BI,2),!,write('Fim de Jogo'), nl, write('Parabens Jogador 2').

jogar(BI,J,BF):-
          jogada(BI,J,BF),
          display_game(BF,J),
          next_player(J,J1),
          !, jogar(BF,J1,_).


%----------------------PC vs PC-----------------------------------------------------------------------------%
jogarpcpc(BI,1,_,_,_):- game_over(BI,1),!,write('Fim de Jogo'), nl, write('Parabens Jogador 1').
jogarpcpc(BI,2,_,_,_):- game_over(BI,2),!,write('Fim de Jogo'), nl, write('Parabens Jogador 2').

jogarpcpc(BI,J,BF,Dif1,Dif2):-                    
          jogadapc(BI,J,BF,Dif2),
          display_game(BF,J),
          next_player(J,J1),
          jogadapc(BF,J1,BFF,Dif1),
          display_game(BFF,J1),
          next_player(J1,J2),
          !, jogarpcpc(BFF,J2,_,Dif1,Dif2).

%----------------------Humano vs PC-----------------------------------------------------------------------------%
jogarhvspc(BI,1,_,_):- game_over(BI,1),!,write('Fim de Jogo'), nl, write('Parabens Jogador 1').
jogarhvspc(BI,2,_,_):- game_over(BI,2),!,write('Fim de Jogo'), nl, write('Parabens Jogador 2').

jogarhvspc(BI,J,BF,Dif):-                    
          jogadapc(BI,J,BF,Dif),
          display_game(BF,J),
          next_player(J,J1),
          jogada(BF,J1,BFF),
          display_game(BFF,J1),
          next_player(J1,J2),
          !, jogarhvspc(BFF,J2,_,Dif).

%----------------------PC vs Humano-----------------------------------------------------------------------------%
jogarpcvsh(BI,1,_,_):- game_over(BI,1),!,write('Fim de Jogo'), nl, write('Parabens Jogador 1').
jogarpcvsh(BI,2,_,_):- game_over(BI,2),!,write('Fim de Jogo'), nl, write('Parabens Jogador 2').

jogarpcvsh(BI,J,BF,Dif):-                    
          jogada(BI,J,BF),
          display_game(BF,J),
          next_player(J,J1),
          jogadapc(BF,J1,BFF,Dif),
          display_game(BFF,J1),
          next_player(J1,J2),
          !, jogarpcvsh(BFF,J2,_,Dif).


                                                                                   
                              
                              
%ATENCAO - para poder fazer display do newboard%
display_game1(P) :- 
                              newboard(B),
                              display_game(B,P).







%-------------------DISPLAY---------------%
display_game(B, P) :-
        write('Current Player: '),
        write(P),
        nl,
        write('   '),
        abc(65),
        nl,
        print_tab(B, 19).

abc(84).
abc(N):-
        put_code(N),
        write('|'),
        N1 is N+1,
        abc(N1).


print_tab([], 0).
print_tab([L|T], N) :-
        N >9,!,
        write(N),
        write('|'),
        N1 is N - 1,
        print_line(L),
        nl,
        print_tab(T, N1).
print_tab([L|T], N) :-
        write(N),
        write(' |'),
        N1 is N - 1,
        print_line(L),
        nl,
        print_tab(T, N1).

print_line([]).
print_line([C|T]):-
        print_cell(C),
        write('-'),
        print_line(T).

print_cell(C) :-
        traduz(C,V),
        write(V).

traduz(0, '+').
traduz(1, 'B').
traduz(2, 'W').

