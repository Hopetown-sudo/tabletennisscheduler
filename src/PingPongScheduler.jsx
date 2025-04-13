import React, { useState, useEffect, useMemo } from 'react';

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function pairPlayers(players) {
  const pairs = [];
  for (let i = 0; i < players.length; i += 2) {
    pairs.push([players[i], players[i + 1]]);
  }
  return pairs;
}

// PlayerCard component to display player stats
function PlayerCard({ name, stats, isEliminated, onViewDetails }) {
  return (
    <div className={`border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow 
                     ${isEliminated ? 'bg-gray-100' : 'bg-white'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg truncate">{name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs 
                         ${isEliminated ? 'bg-gray-200 text-gray-600' : 'bg-green-100 text-green-800'}`}>
          {isEliminated ? 'Eliminated' : 'Active'}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2 my-3 text-center">
        <div className="bg-blue-50 p-2 rounded">
          <div className="text-xs text-gray-500">Wins</div>
          <div className="font-semibold">{stats.wins}</div>
        </div>
        <div className="bg-red-50 p-2 rounded">
          <div className="text-xs text-gray-500">Losses</div>
          <div className="font-semibold">{stats.losses}</div>
        </div>
        <div className="bg-purple-50 p-2 rounded">
          <div className="text-xs text-gray-500">Matches</div>
          <div className="font-semibold">{stats.matches}</div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mb-1">Current Status:</div>
      <div className="text-sm font-medium mb-3">
        {stats.currentRound?.includes('BYE') ? (
          <span className="flex items-center">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-400 mr-1"></span>
            {stats.currentRound}
          </span>
        ) : (
          stats.currentRound || 'Not yet playing'
        )}
      </div>
      
      <button 
        onClick={onViewDetails}
        className="w-full text-center text-sm text-blue-600 hover:text-blue-800 mt-1"
      >
        View Match History
      </button>
    </div>
  );
}

export default function PingPongScheduler() {
  const [sortMethod, setSortMethod] = useState('progress'); // 排序方式：progress, wins, name
  const [tournamentHistory, setTournamentHistory] = useState([]); // 用于撤回功能
  const [playerInput, setPlayerInput] = useState('');
  const [playerNames, setPlayerNames] = useState([]);
  const [round1Pairs, setRound1Pairs] = useState([]);
  const [round1Winners, setRound1Winners] = useState([]);
  const [round2Pairs, setRound2Pairs] = useState([]);
  const [round2Winners, setRound2Winners] = useState([]);
  const [quarterFinals, setQuarterFinals] = useState([]);
  const [quarterWinners, setQuarterWinners] = useState([]);
  const [semiFinals, setSemiFinals] = useState([]);
  const [semiWinners, setSemiWinners] = useState([]);
  const [finals, setFinals] = useState([]);
  const [finalWinners, setFinalWinners] = useState([]);
  const [thirdPlaceMatch, setThirdPlaceMatch] = useState([]);
  const [thirdPlaceWinner, setThirdPlaceWinner] = useState('');
  const [byeGroup, setByeGroup] = useState([]);
  const [drawn, setDrawn] = useState(false);
  
  // New state for player stats and match history
  const [playerStats, setPlayerStats] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  
  const validNames = playerNames.filter(name => name.trim().length > 0);

  const saveCurrentState = () => {
    const currentState = {
      round1Pairs: [...round1Pairs],
      round1Winners: [...round1Winners],
      round2Pairs: [...round2Pairs],
      round2Winners: [...round2Winners],
      quarterFinals: [...quarterFinals],
      quarterWinners: [...quarterWinners],
      semiFinals: [...semiFinals],
      semiWinners: [...semiWinners],
      finals: [...finals],
      finalWinners: [...finalWinners],
      thirdPlaceMatch: [...thirdPlaceMatch],
      thirdPlaceWinner: thirdPlaceWinner
    };
    setTournamentHistory(prev => [...prev, currentState]);
  };
  // 添加撤回功能
  const handleUndo = () => {
    if (tournamentHistory.length === 0) return;
    
    const prevState = tournamentHistory[tournamentHistory.length - 1];
    setRound1Pairs(prevState.round1Pairs);
    setRound1Winners(prevState.round1Winners);
    setRound2Pairs(prevState.round2Pairs);
    setRound2Winners(prevState.round2Winners);
    setQuarterFinals(prevState.quarterFinals);
    setQuarterWinners(prevState.quarterWinners);
    setSemiFinals(prevState.semiFinals);
    setSemiWinners(prevState.semiWinners);
    setFinals(prevState.finals);
    setFinalWinners(prevState.finalWinners);
    setThirdPlaceMatch(prevState.thirdPlaceMatch);
    setThirdPlaceWinner(prevState.thirdPlaceWinner);
    
    setTournamentHistory(prev => prev.slice(0, -1));
  };

  // Calculate player stats based on tournament progress
  useEffect(() => {
    if (validNames.length === 0) return;
    
    const stats = {};
    
    // Initialize stats for all players
    validNames.forEach(name => {
      if (!stats[name]) {
        stats[name] = {
          wins: 0,
          losses: 0,
          matches: 0,
          matchHistory: [],
          currentRound: 'Not started'
        };
      }
    });
    
    // Process round 1 results
    if (round1Pairs.length > 0) {
      round1Pairs.forEach(([p1, p2], idx) => {
        if (!stats[p1]) stats[p1] = { wins: 0, losses: 0, matches: 0, matchHistory: [], currentRound: 'Round 1' };
        if (!stats[p2]) stats[p2] = { wins: 0, losses: 0, matches: 0, matchHistory: [], currentRound: 'Round 1' };
        
        stats[p1].matches++;
        stats[p2].matches++;
        
        const winner = round1Winners[idx];
        if (winner) {
          const loser = winner === p1 ? p2 : p1;
          stats[winner].wins++;
          stats[loser].losses++;
          stats[winner].currentRound = 'Advanced to Quarterfinals';
          stats[loser].currentRound = 'Moved to Round 2';
          
          // Add to match history
          const result = {
            round: 'Round 1',
            opponent: loser,
            result: 'win'
          };
          stats[winner].matchHistory.push(result);
          
          stats[loser].matchHistory.push({
            round: 'Round 1',
            opponent: winner,
            result: 'loss'
          });
        }
      });
    }
    
    byeGroup.forEach(player => {
      if (!stats[player]) {
        stats[player] = { wins: 0, losses: 0, matches: 0, matchHistory: [], currentRound: 'Round 1 (BYE)' };
      } else if (!stats[player].currentRound || stats[player].currentRound === 'Not started') {
        stats[player].currentRound = 'Round 1 (BYE)';
      }
    });
    
    // Process round 2 results
    if (round2Pairs.length > 0) {
      round2Pairs.forEach(([p1, p2], idx) => {
        if (!stats[p1]) stats[p1] = { wins: 0, losses: 0, matches: 0, matchHistory: [], currentRound: 'Round 2' };
        if (!stats[p2]) stats[p2] = { wins: 0, losses: 0, matches: 0, matchHistory: [], currentRound: 'Round 2' };
        
        // Update only if not already counted from bye group
        if (stats[p1].currentRound !== 'Advanced to Quarterfinals') {
          if (byeGroup.includes(p1)) {
            stats[p1].currentRound = 'Round 2 (BYE in Round 1)';
          } else {
            stats[p1].currentRound = 'Round 2';
          }
        }
        
        if (stats[p2].currentRound !== 'Advanced to Quarterfinals') {
          if (byeGroup.includes(p2)) {
            stats[p2].currentRound = 'Round 2 (BYE in Round 1)';
          } else {
            stats[p2].currentRound = 'Round 2';
          }
        }
        
        stats[p1].matches++;
        stats[p2].matches++;
        
        const winner = round2Winners[idx];
        if (winner) {
          const loser = winner === p1 ? p2 : p1;
          stats[winner].wins++;
          stats[loser].losses++;
          stats[winner].currentRound = 'Advanced to Quarterfinals';
          stats[loser].currentRound = 'Eliminated in Round 2';
          
          // Add to match history
          stats[winner].matchHistory.push({
            round: 'Round 2',
            opponent: loser,
            result: 'win'
          });
          
          stats[loser].matchHistory.push({
            round: 'Round 2',
            opponent: winner,
            result: 'loss'
          });
        }
      });
    }
    
    // Process quarterfinals
    if (quarterFinals.length > 0) {
      quarterFinals.forEach(([p1, p2], idx) => {
        stats[p1].currentRound = 'Quarterfinals';
        stats[p2].currentRound = 'Quarterfinals';
        stats[p1].matches++;
        stats[p2].matches++;
        
        const winner = quarterWinners[idx];
        if (winner) {
          const loser = winner === p1 ? p2 : p1;
          stats[winner].wins++;
          stats[loser].losses++;
          stats[winner].currentRound = 'Advanced to Semifinals';
          stats[loser].currentRound = 'Eliminated in Quarterfinals';
          
          // Add to match history
          stats[winner].matchHistory.push({
            round: 'Quarterfinals',
            opponent: loser,
            result: 'win'
          });
          
          stats[loser].matchHistory.push({
            round: 'Quarterfinals',
            opponent: winner,
            result: 'loss'
          });
        }
      });
    }
    
    // Process semifinals
    if (semiFinals.length > 0) {
      semiFinals.forEach(([p1, p2], idx) => {
        stats[p1].currentRound = 'Semifinals';
        stats[p2].currentRound = 'Semifinals';
        stats[p1].matches++;
        stats[p2].matches++;
        
        const winner = semiWinners[idx];
        if (winner) {
          const loser = winner === p1 ? p2 : p1;
          stats[winner].wins++;
          stats[loser].losses++;
          stats[winner].currentRound = 'Advanced to Finals';
          stats[loser].currentRound = 'Playing for 3rd Place';
          
          // Add to match history
          stats[winner].matchHistory.push({
            round: 'Semifinals',
            opponent: loser,
            result: 'win'
          });
          
          stats[loser].matchHistory.push({
            round: 'Semifinals',
            opponent: winner,
            result: 'loss'
          });
        }
      });
    }
    
    // Process finals
    if (finals.length > 0) {
      finals.forEach(([p1, p2], idx) => {
        stats[p1].currentRound = 'Finals';
        stats[p2].currentRound = 'Finals';
        stats[p1].matches++;
        stats[p2].matches++;
        
        const winner = finalWinners[idx];
        if (winner) {
          const loser = winner === p1 ? p2 : p1;
          stats[winner].wins++;
          stats[loser].losses++;
          stats[winner].currentRound = 'Tournament Champion!';
          stats[loser].currentRound = 'Tournament Runner-up';
          
          // Add to match history
          stats[winner].matchHistory.push({
            round: 'Finals',
            opponent: loser,
            result: 'win'
          });
          
          stats[loser].matchHistory.push({
            round: 'Finals',
            opponent: winner,
            result: 'loss'
          });
        }
      });
    }
    
    // Process third place match
    if (thirdPlaceMatch.length > 0 && thirdPlaceMatch[0]?.length === 2) {
      const [p1, p2] = thirdPlaceMatch[0];
      stats[p1].currentRound = '3rd Place Match';
      stats[p2].currentRound = '3rd Place Match';
      stats[p1].matches++;
      stats[p2].matches++;
      
      if (thirdPlaceWinner) {
        const loser = thirdPlaceWinner === p1 ? p2 : p1;
        stats[thirdPlaceWinner].wins++;
        stats[loser].losses++;
        stats[thirdPlaceWinner].currentRound = '3rd Place Winner';
        stats[loser].currentRound = '4th Place';
        
        // Add to match history
        stats[thirdPlaceWinner].matchHistory.push({
          round: '3rd Place Match',
          opponent: loser,
          result: 'win'
        });
        
        stats[loser].matchHistory.push({
          round: '3rd Place Match',
          opponent: thirdPlaceWinner,
          result: 'loss'
        });
      }
    }
    
    // Add bye status for players who skipped round 1
    byeGroup.forEach(player => {
      if (!stats[player]?.currentRound || stats[player]?.currentRound === 'Not started') {
        stats[player].currentRound = 'Round 2 (Bye in Round 1)';
      }
    });
    
    setPlayerStats(stats);
  }, [validNames, round1Pairs, round1Winners, round2Pairs, round2Winners, 
      quarterFinals, quarterWinners, semiFinals, semiWinners, 
      finals, finalWinners, thirdPlaceMatch, thirdPlaceWinner, byeGroup]);

  const updateWinners = (currentWinners, setWinners) => (winner, matchIndex) => {
    saveCurrentState(); // 在更改前保存当前状态

    const newWinners = [...currentWinners];
    while (newWinners.length <= matchIndex) newWinners.push(null);
    newWinners[matchIndex] = newWinners[matchIndex] === winner ? null : winner;
    setWinners(newWinners);
  };

  const handleRound1Win = updateWinners(round1Winners, setRound1Winners);
  const handleRound2Win = updateWinners(round2Winners, setRound2Winners);
  const handleQuarterWin = updateWinners(quarterWinners, setQuarterWinners);
  const handleSemiWin = updateWinners(semiWinners, setSemiWinners);
  const handleFinalWin = updateWinners(finalWinners, setFinalWinners);

  const handleInputSubmit = () => {
    const names = playerInput.split(/[\n,]+/).map(name => name.trim()).filter(name => name.length > 0);
    setPlayerNames(names);
  };

  const drawRound1 = () => {
    const shuffled = shuffleArray(validNames);
    const round1 = shuffled.slice(0, 8);
    const bye = shuffled.slice(8);
    setByeGroup(bye);
    const pairs = pairPlayers(round1);
    setRound1Pairs(pairs);
    setRound1Winners(new Array(pairs.length).fill(null));
    setRound2Pairs([]);
    setRound2Winners([]);
    setQuarterFinals([]);
    setQuarterWinners([]);
    setSemiFinals([]);
    setSemiWinners([]);
    setFinals([]);
    setFinalWinners([]);
    setThirdPlaceMatch([]);
    setThirdPlaceWinner('');
    setDrawn(true);
  };

  const startRound2 = () => {
    saveCurrentState(); // 在更改前保存当前状态
    
    const losers = round1Pairs.map(([p1, p2], i) => {
      const winner = round1Winners[i];
      return winner === p1 ? p2 : p1;
    });
    const round2 = pairPlayers([...losers, ...byeGroup]);
    setRound2Pairs(round2);
    setRound2Winners(new Array(round2.length).fill(null));
  };

  const startQuarterFinals = () => {
    saveCurrentState(); // 在更改前保存当前状态

    const advancers = [...round1Winners, ...round2Winners].filter(Boolean);
    if (advancers.length !== 8) return alert(`Need 8 players to start quarterfinals. Got ${advancers.length}`);
    setQuarterFinals(pairPlayers(advancers));
    setQuarterWinners([]);
  };

  const startSemiFinals = () => {
    saveCurrentState(); // 在更改前保存当前状态
    
    if (quarterWinners.filter(Boolean).length !== 4) return alert('Need 4 winners to start semifinals.');
    setSemiFinals(pairPlayers(quarterWinners.filter(Boolean)));
    setSemiWinners([]);
  };

  const startFinals = () => {
    saveCurrentState(); // 在更改前保存当前状态
    
    if (semiWinners.filter(Boolean).length !== 2) return alert('Need 2 winners to start finals.');
    const finalPair = semiWinners.filter(Boolean);
    setFinals([finalPair]);

    const losers = semiFinals.map(([p1, p2], i) => {
      const winner = semiWinners[i];
      if (!winner) return null;
      return winner === p1 ? p2 : p1;
    }).filter(Boolean);

    setThirdPlaceMatch([losers]);
    setFinalWinners([]);
    setThirdPlaceWinner('');
  };

  const handleThirdPlaceWin = (winner) => setThirdPlaceWinner(winner);

  const isRound1Complete = round1Winners.filter(Boolean).length === round1Pairs.length;
  const isRound2Complete = round2Winners.filter(Boolean).length === round2Pairs.length;
  const canStartQuarterFinals = round1Winners.filter(Boolean).length + round2Winners.filter(Boolean).length === 8;
  const canStartSemis = quarterWinners.filter(Boolean).length === quarterFinals.length;
  const canStartFinals = semiWinners.filter(Boolean).length === semiFinals.length;
  
  // Player management utilities
  const handleViewPlayerDetails = (player) => {
    setSelectedPlayer(player);
    setShowPlayerModal(true);
  };
  
  const closePlayerModal = () => {
    setShowPlayerModal(false);
    setSelectedPlayer(null);
  };
  // 修改sortedPlayers函数，根据用户选择的排序方式排序
const sortedPlayers = useMemo(() => {
  if (Object.keys(playerStats).length === 0) return [];
  
  return validNames.sort((a, b) => {
    if (sortMethod === 'progress') {
      // 原有的按比赛进度排序代码
      const rankOrder = {
        'Tournament Champion!': 1,
        'Tournament Runner-up': 2,
        '3rd Place Winner': 3,
        '4th Place': 4,
        'Advanced to Finals': 5,
        'Playing for 3rd Place': 6,
        'Advanced to Semifinals': 7,
        'Eliminated in Quarterfinals': 8, 
        'Advanced to Quarterfinals': 9,
        'Eliminated in Round 2': 10,
        'Round 2 (BYE in Round 1)': 11, // 轮空选手的位置
        'Round 2': 12,
        'Moved to Round 2': 13,
        'Round 1 (BYE)': 14, // 轮空选手的初始位置
        'Round 1': 15,
        'Not started': 16
      };
      
      const aRank = rankOrder[playerStats[a]?.currentRound] || 999;
      const bRank = rankOrder[playerStats[b]?.currentRound] || 999;
      
      if (aRank !== bRank) return aRank - bRank;
      
      // 然后按胜场数
      const aWins = playerStats[a]?.wins || 0;
      const bWins = playerStats[b]?.wins || 0;
      
      if (aWins !== bWins) return bWins - aWins;
    } 
    else if (sortMethod === 'wins') {
      // 按胜场数排序
      const aWins = playerStats[a]?.wins || 0;
      const bWins = playerStats[b]?.wins || 0;
      
      if (aWins !== bWins) return bWins - aWins;
    }
    
    // 默认按字母顺序
    return a.localeCompare(b);
  });
}, [validNames, playerStats, sortMethod]); // 添加sortMethod作为依赖项
  // Get players sorted by tournament progress
  // const sortedPlayers = useMemo(() => {
  //   if (Object.keys(playerStats).length === 0) return [];
    
  //   const rankOrder = {
  //     'Tournament Champion!': 1,
  //     'Tournament Runner-up': 2,
  //     '3rd Place Winner': 3,
  //     '4th Place': 4,
  //     'Advanced to Finals': 5,
  //     'Playing for 3rd Place': 6,
  //     'Advanced to Semifinals': 7,
  //     'Eliminated in Quarterfinals': 8,
  //     'Advanced to Quarterfinals': 9,
  //     'Eliminated in Round 2': 10,
  //     'Round 2': 11,
  //     'Round 2 (Bye in Round 1)': 12,
  //     'Moved to Round 2': 13,
  //     'Round 1': 14,
  //     'Not started': 15
  //   };
    
  //   return validNames.sort((a, b) => {
  //     // First sort by tournament progress
  //     const aRank = rankOrder[playerStats[a]?.currentRound] || 999;
  //     const bRank = rankOrder[playerStats[b]?.currentRound] || 999;
      
  //     if (aRank !== bRank) return aRank - bRank;
      
  //     // Then by win count
  //     const aWins = playerStats[a]?.wins || 0;
  //     const bWins = playerStats[b]?.wins || 0;
      
  //     if (aWins !== bWins) return bWins - aWins;
      
  //     // Then alphabetically
  //     return a.localeCompare(b);
  //   });
  // }, [validNames, playerStats]);
  
  // Determine if a player is eliminated
  const isPlayerEliminated = (player) => {
    const status = playerStats[player]?.currentRound || '';
    return status.includes('Eliminated') || status === '4th Place';
  };

  // 添加到组件中的函数
  const exportToCSV = () => {
    // 准备表头
    let csvContent = "Player Name,Wins,Losses,Matches,Current Status,Match History\n";
    
    // 按排序后的玩家顺序添加数据
    sortedPlayers.forEach(playerName => {
      const player = playerStats[playerName] || { 
        wins: 0, losses: 0, matches: 0, 
        currentRound: 'Not started', 
        matchHistory: [] 
      };
      
      // 格式化比赛历史为CSV友好的格式
      const matchHistoryText = player.matchHistory.map(match => 
        `${match.round} vs ${match.opponent} (${match.result})`
      ).join("; ");
      
      // 将玩家数据添加到CSV
      csvContent += `"${playerName}",${player.wins},${player.losses},${player.matches},"${player.currentRound}","${matchHistoryText}"\n`;
    });
    
    // 创建一个下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // 设置文件名为当前日期+时间
    const date = new Date();
    const fileName = `ping_pong_tournament_${date.toISOString().slice(0,10)}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    // 添加到页面并触发点击
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
  };

  // 如果比赛完成了，还可以添加一个特殊的结果CSV
  const exportFinalStandings = () => {
    if (!(finalWinners.length === 1 && thirdPlaceWinner)) return;
    
    // 准备冠军数据
    let csvContent = "Rank,Player Name,Result\n";
    csvContent += `1,"${finalWinners[0]}",Champion\n`;
    csvContent += `2,"${finals[0].find(p => p !== finalWinners[0])}",Runner-up\n`;
    csvContent += `3,"${thirdPlaceWinner}",Third Place\n`;
    csvContent += `4,"${thirdPlaceMatch[0].find(p => p !== thirdPlaceWinner)}",Fourth Place\n`;
    
    // 添加所有选手数据
    let rank = 5;
    sortedPlayers.forEach(playerName => {
      if (
        playerName !== finalWinners[0] && 
        playerName !== finals[0].find(p => p !== finalWinners[0]) &&
        playerName !== thirdPlaceWinner &&
        playerName !== thirdPlaceMatch[0].find(p => p !== thirdPlaceWinner)
      ) {
        csvContent += `${rank++},"${playerName}","${playerStats[playerName]?.currentRound || 'Unknown'}"\n`;
      }
    });
    
    // 创建下载链接
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    const date = new Date();
    const fileName = `ping_pong_final_standings_${date.toISOString().slice(0,10)}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">🏓 Table Tennis Tournament - Match Maker </h1>
  
      {!drawn && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-3">Setup Tournament</h2>
          <textarea
            className="w-full border p-2 rounded"
            rows={5}
            placeholder="Enter player names (comma or newline separated)"
            value={playerInput}
            onChange={e => setPlayerInput(e.target.value)}
          />
          <div className="flex flex-wrap gap-4 mt-4">
            <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleInputSubmit}>Submit Players</button>
            {playerNames.length > 0 && (
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={drawRound1}>Draw Round 1</button>
            )}
          </div>
        </div>
      )}
  
      {drawn && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <h2 className="text-xl font-semibold mb-4">Tournament Bracket</h2>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Tournament Bracket</h2>
                  <button 
                    onClick={handleUndo}
                    disabled={tournamentHistory.length === 0}
                    className={`px-3 py-1 rounded text-sm ${tournamentHistory.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    ↩ Undo Last Action
                  </button>
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {round1Pairs.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 pb-2 border-b">Round 1</h3>
                    {round1Pairs.map(([p1, p2], i) => (
                      <div key={i} className="flex gap-2 my-2 text-sm">
                        {[p1, p2].map(p => (
                          <div
                            key={p}
                            onClick={() => handleRound1Win(p, i)}
                            className={`cursor-pointer border px-3 py-2 rounded flex-1 text-center
                                     ${round1Winners[i] === p ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ))}
                    {isRound1Complete && (
                      <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm w-full" onClick={startRound2}>
                        Start Round 2
                      </button>
                    )}
                  </div>
                )}
  
                {round2Pairs.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 pb-2 border-b">Round 2</h3>
                    {round2Pairs.map(([p1, p2], i) => (
                      <div key={i} className="flex gap-2 my-2 text-sm">
                        {[p1, p2].map(p => (
                          <div
                            key={p}
                            onClick={() => handleRound2Win(p, i)}
                            className={`cursor-pointer border px-3 py-2 rounded flex-1 text-center
                                     ${round2Winners[i] === p ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ))}
                    {isRound2Complete && canStartQuarterFinals && (
                      <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm w-full" onClick={startQuarterFinals}>
                        Start Quarterfinals
                      </button>
                    )}
                  </div>
                )}
  
                {quarterFinals.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 pb-2 border-b">Quarterfinals</h3>
                    {quarterFinals.map(([p1, p2], i) => (
                      <div key={i} className="flex gap-2 my-2 text-sm">
                        {[p1, p2].map(p => (
                          <div
                            key={p}
                            onClick={() => handleQuarterWin(p, i)}
                            className={`cursor-pointer border px-3 py-2 rounded flex-1 text-center
                                     ${quarterWinners[i] === p ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ))}
                    {canStartSemis && (
                      <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm w-full" onClick={startSemiFinals}>
                        Start Semifinals
                      </button>
                    )}
                  </div>
                )}
  
                {semiFinals.length > 0 && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="text-lg font-semibold mb-2 pb-2 border-b">Semifinals</h3>
                    {semiFinals.map(([p1, p2], i) => (
                      <div key={i} className="flex gap-2 my-2 text-sm">
                        {[p1, p2].map(p => (
                          <div
                            key={p}
                            onClick={() => handleSemiWin(p, i)}
                            className={`cursor-pointer border px-3 py-2 rounded flex-1 text-center
                                     ${semiWinners[i] === p ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-100'}`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ))}
                    {canStartFinals && (
                      <button className="mt-4 bg-purple-600 text-white px-4 py-2 rounded text-sm w-full" onClick={startFinals}>
                        Start Finals
                      </button>
                    )}
                  </div>
                )}
  
                {finals.length > 0 && (
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-3 rounded-lg border border-yellow-200">
                    <h3 className="text-lg font-semibold mb-2 pb-2 border-b border-yellow-200">Finals</h3>
                    {finals.map(([p1, p2], i) => (
                      <div key={i} className="flex gap-2 my-2 text-sm">
                        {[p1, p2].map(p => (
                          <div
                            key={p}
                            onClick={() => handleFinalWin(p, i)}
                            className={`cursor-pointer border px-3 py-2 rounded flex-1 text-center
                                     ${finalWinners[i] === p ? 'bg-yellow-200 border-yellow-400 font-bold' : 'hover:bg-yellow-50'}`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
  
                {thirdPlaceMatch.length > 0 && (
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100 p-3 rounded-lg border border-amber-200">
                    <h3 className="text-lg font-semibold mb-2 pb-2 border-b border-amber-200">3rd Place Match</h3>
                    {thirdPlaceMatch.map(([p1, p2], i) => (
                      <div key={i} className="flex gap-2 my-2 text-sm">
                        {[p1, p2].map(p => (
                          <div
                            key={p}
                            onClick={() => handleThirdPlaceWin(p)}
                            className={`cursor-pointer border px-3 py-2 rounded flex-1 text-center
                                     ${thirdPlaceWinner === p ? 'bg-amber-200 border-amber-400 font-bold' : 'hover:bg-amber-50'}`}
                          >
                            {p}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
  
              {finalWinners.length === 1 && thirdPlaceWinner && (
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-100 to-amber-100 rounded-lg">
                  <h2 className="text-xl font-bold mb-3">🏆 Final Standings</h2>
                  <ol className="list-decimal list-inside">
                    <li className="text-lg font-semibold py-1">🥇 {finalWinners[0]}</li>
                    <li className="text-lg py-1">🥈 {finals[0].find(p => p !== finalWinners[0])}</li>
                    <li className="text-lg py-1">🥉 {thirdPlaceWinner}</li>
                    <li className="text-lg py-1">4️⃣ {thirdPlaceMatch[0].find(p => p !== thirdPlaceWinner)}</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
          
          {/* Player Cards Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Players</h2>
            <div className="flex items-center gap-2">
              <label htmlFor="sort-select" className="text-sm text-gray-600">Sort by:</label>
              <select 
                id="sort-select"
                value={sortMethod}
                onChange={(e) => setSortMethod(e.target.value)}
                className="text-sm border rounded p-1"
              >
                <option value="progress">Tournament Progress</option>
                <option value="wins">Wins</option>
                <option value="name">Name</option>
              </select>
              {drawn && (
                <>
                  <button
                    onClick={exportToCSV}
                    className="ml-2 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700"
                  >
                    Export CSV
                  </button>
                  <span className="text-sm text-gray-500 ml-2">{validNames.length} total</span>
                </>
              )}
            </div>
            </div>
              
              <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2">
                {drawn && sortedPlayers.map(player => (
                  <PlayerCard 
                    key={player}
                    name={player}
                    stats={playerStats[player] || { wins: 0, losses: 0, matches: 0, currentRound: 'Not started', matchHistory: [] }}
                    isEliminated={isPlayerEliminated(player)}
                    onViewDetails={() => handleViewPlayerDetails(player)}
                  />
                ))}
                
                {!drawn && validNames.length > 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p>Draw round 1 to see player stats</p>
                  </div>
                )}
                
                {!drawn && validNames.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <p>Enter player names to begin</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Player Details Modal */}
      {showPlayerModal && selectedPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">{selectedPlayer}</h3>
                <button 
                  onClick={closePlayerModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Current Status</div>
                  <div className="font-medium">
                    {playerStats[selectedPlayer]?.currentRound || 'Not started'}
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-500">Record</div>
                  <div className="font-medium">
                    {playerStats[selectedPlayer]?.wins || 0}W - {playerStats[selectedPlayer]?.losses || 0}L
                  </div>
                </div>
              </div>
              
              <h4 className="font-semibold mb-3 text-lg">Match History</h4>
              {playerStats[selectedPlayer]?.matchHistory?.length > 0 ? (
                <div className="space-y-2">
                  {playerStats[selectedPlayer].matchHistory.map((match, idx) => (
                    <div key={idx} className={`p-3 rounded border ${match.result === 'win' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex justify-between">
                        <span className="font-medium">{match.round}</span>
                        <span className={`font-medium ${match.result === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                          {match.result === 'win' ? 'Victory' : 'Defeat'}
                        </span>
                      </div>
                      <div className="text-sm mt-1">
                        vs. {match.opponent}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 text-center py-4">
                  No matches played yet
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-b-lg border-t">
              <button
                onClick={closePlayerModal}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}