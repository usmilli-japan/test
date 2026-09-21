import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, Plus, 
  Eye, EyeOff, Search, Copy, Check,
  Send, AlertCircle, ShieldCheck, Clock, ArrowRight,
  TrendingUp, TrendingDown, Info, QrCode, X, Sparkles,
  Bell, Compass, PieChart, Shield, ArrowLeftRight,
  CheckCircle2, ChevronRight, Scan, ChevronDown
} from 'lucide-react';

const WALLET_ADDRESS = "0x71C7656EC7ab88b098defB751B7401B5f6d89A4";

const NETWORKS = [
  { id: 'bsc', name: 'BNB Smart Chain (BEP20)', shortName: 'BNB Chain', icon: '🟡', nativeToken: 'BNB', color: '#F0B90B' },
  { id: 'eth', name: 'Ethereum (ERC20)', shortName: 'Ethereum', icon: '🔷', nativeToken: 'ETH', color: '#627EEA' },
  { id: 'polygon', name: 'Polygon (POS)', shortName: 'Polygon', icon: '🟣', nativeToken: 'MATIC', color: '#8247E5' },
  { id: 'arbitrum', name: 'Arbitrum One', shortName: 'Arbitrum', icon: '🔵', nativeToken: 'ETH', color: '#28A0F0' },
  { id: 'solana', name: 'Solana Network', shortName: 'Solana', icon: '🟣', nativeToken: 'SOL', color: '#14F195' },
];

// Initial assets in JPY valuation (BNB starts at ¥50,000, USDT at ¥20,000 -> Initial Total = ¥70,000)
const INITIAL_TOKENS = [
  { 
    id: 'bnb', 
    symbol: 'BNB', 
    name: 'BNB', 
    chain: 'BEP20', 
    balanceJPY: 50000, 
    priceJPY: 85000, 
    change24h: 3.42, 
    icon: '🟡', 
    networkId: 'bsc' 
  },
  { 
    id: 'usdt', 
    symbol: 'USDT', 
    name: 'Tether USD', 
    chain: 'BEP20', 
    balanceJPY: 20000, 
    priceJPY: 155, 
    change24h: 0.05, 
    icon: '💵', 
    networkId: 'bsc' 
  },
  { 
    id: 'btc', 
    symbol: 'BTC', 
    name: 'Bitcoin', 
    chain: 'BEP20', 
    balanceJPY: 0, 
    priceJPY: 10200000, 
    change24h: 1.15, 
    icon: '🟠', 
    networkId: 'bsc' 
  },
  { 
    id: 'eth', 
    symbol: 'ETH', 
    name: 'Ethereum', 
    chain: 'ERC20', 
    balanceJPY: 0, 
    priceJPY: 540000, 
    change24h: -0.85, 
    icon: '🔷', 
    networkId: 'eth' 
  },
];

const INITIAL_NFTS = [
  { id: 'nft1', name: 'Binance Key #0892', collection: 'Binance Badges', image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop&q=60', valueJPY: 18000 },
  { id: 'nft2', name: 'Bored Ape #4829', collection: 'BAYC', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60', valueJPY: 2800000 },
];

const DEFI_POSITIONS = [
  { id: 'd1', protocol: 'PancakeSwap V3', pool: 'BNB / USDT Liquidity', APY: '14.2%', stakedJPY: 45000, earnedJPY: 620 },
  { id: 'd2', protocol: 'Binance Simple Earn', pool: 'USDT Flexible', APY: '8.5%', stakedJPY: 15000, earnedJPY: 185 },
];

export default function App() {
  const [appMode, setAppMode] = useState('web3'); // 'web3' | 'exchange'
  const [activeTab, setActiveTab] = useState('assets'); // 'assets' | 'nfts' | 'defi' | 'history'
  const [bottomNav, setBottomNav] = useState('wallet'); // 'wallet' | 'swap' | 'earn' | 'discover'

  const [selectedNetwork, setSelectedNetwork] = useState(NETWORKS[0]);
  const [hideBalance, setHideBalance] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  const [tokens, setTokens] = useState(INITIAL_TOKENS);
  const [transactions, setTransactions] = useState([
    { 
      id: 'tx1', 
      type: 'receive', 
      symbol: 'BNB', 
      amountJPY: 15000, 
      tokenAmount: 0.1764, 
      address: '0x32A...19B', 
      time: '12 mins ago', 
      status: 'Completed', 
      hash: '0x9a8f...21c' 
    },
    { 
      id: 'tx2', 
      type: 'send', 
      symbol: 'USDT', 
      amountJPY: 5000, 
      tokenAmount: 32.25, 
      address: '0x88F...421', 
      time: '3 hours ago', 
      status: 'Completed', 
      hash: '0x4e2b...88a' 
    }
  ]);

  const [modalType, setModalType] = useState(null); // 'send' | 'receive' | 'swap' | 'deposit' | null
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalBalanceJPY = useMemo(() => {
    return tokens.reduce((sum, token) => sum + token.balanceJPY, 0);
  }, [tokens]);

  const pnl24h = useMemo(() => {
    const totalChange = tokens.reduce((acc, t) => acc + (t.balanceJPY * (t.change24h / 100)), 0);
    const pct = totalBalanceJPY > 0 ? (totalChange / totalBalanceJPY) * 100 : 0;
    return { jpy: totalChange, pct };
  }, [tokens, totalBalanceJPY]);

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      const matchNet = selectedNetwork.id === 'bsc' ? true : t.networkId === selectedNetwork.id;
      return matchSearch && matchNet;
    });
  }, [tokens, searchQuery, selectedNetwork]);

  const filteredActivity = useMemo(() => {
    if (historyFilter === 'all') return transactions;
    return transactions.filter(t => t.type === historyFilter);
  }, [transactions, historyFilter]);

  return (
    <div className="min-h-screen bg-[#0B0E11] text-[#EAEXSF] font-sans flex flex-col items-center justify-start p-2 sm:p-6 select-none">
      
      {/* Toast Alert Banner */}
      {toastMessage && (
        <div className="fixed top-5 z-50 bg-[#F0B90B] text-[#0B0E11] px-5 py-3 rounded-xl font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-[#0B0E11]/20">
          <CheckCircle2 size={18} className="stroke-[2.5]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container / Mobile Mock Frame */}
      <div className="w-full max-w-lg bg-[#181A20] border border-[#2B313A] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col min-h-[92vh]">
        
        {/* Top Header Navigation Bar */}
        <header className="px-4 py-3 bg-[#181A20] border-b border-[#2B313A] flex items-center justify-between gap-2">
          
          {/* Exchange vs Web3 Mode Toggle */}
          <div className="bg-[#0B0E11] p-1 rounded-xl flex items-center border border-[#2B313A]">
            <button
              onClick={() => {
                setAppMode('exchange');
                showToast("Switched to Binance Exchange Mode");
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                appMode === 'exchange' ? 'bg-[#2B313A] text-white' : 'text-[#848E9C] hover:text-white'
              }`}
            >
              Exchange
            </button>
            <button
              onClick={() => setAppMode('web3')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                appMode === 'web3' ? 'bg-[#F0B90B] text-[#0B0E11]' : 'text-[#848E9C] hover:text-white'
              }`}
            >
              <Shield size={12} />
              Web3
            </button>
          </div>

          {/* Network Selector & Address Pills */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button className="flex items-center gap-1.5 bg-[#0B0E11] hover:bg-[#2B313A] text-white px-2.5 py-1.5 rounded-xl text-xs font-medium border border-[#2B313A] transition-all">
                <span>{selectedNetwork.icon}</span>
                <ChevronDown size={12} className="text-[#848E9C]" />
              </button>
              
              <div className="absolute right-0 mt-2 w-56 bg-[#181A20] border border-[#2B313A] rounded-xl shadow-2xl py-1 hidden group-hover:block z-40">
                <div className="px-3 py-1.5 text-[10px] text-[#848E9C] uppercase font-bold border-b border-[#2B313A]">
                  Select Network
                </div>
                {NETWORKS.map(net => (
                  <button
                    key={net.id}
                    onClick={() => setSelectedNetwork(net)}
                    className="w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#2B313A] text-white transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>{net.icon}</span>
                      <span>{net.shortName}</span>
                    </span>
                    {selectedNetwork.id === net.id && <Check size={14} className="text-[#F0B90B]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Address Pill */}
            <button
              onClick={() => {
                navigator.clipboard.writeText(WALLET_ADDRESS);
                showToast("Wallet address copied to clipboard");
              }}
              className="flex items-center gap-1 bg-[#0B0E11] hover:bg-[#2B313A] text-[#848E9C] hover:text-white px-2.5 py-1.5 rounded-xl text-xs font-mono border border-[#2B313A] transition-colors"
            >
              <span>0x71C...89A4</span>
              <Copy size={12} />
            </button>

            <button 
              onClick={() => setModalType('receive')} 
              className="text-[#848E9C] hover:text-white p-1"
              title="QR Code Scan"
            >
              <Scan size={18} />
            </button>
          </div>
        </header>

        {/* Balance & Overview Card Section */}
        <div className="p-5 bg-gradient-to-b from-[#181A20] via-[#1E2329] to-[#181A20] border-b border-[#2B313A]">
          <div className="flex items-center justify-between text-xs text-[#848E9C]">
            <div className="flex items-center gap-1.5">
              <span>Total Balance (JPY)</span>
              <button onClick={() => setHideBalance(!hideBalance)} className="hover:text-white transition-colors">
                {hideBalance ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <span className="text-[10px] text-[#03A66D] bg-[#03A66D]/10 px-2 py-0.5 rounded font-medium border border-[#03A66D]/20 flex items-center gap-1">
              <ShieldCheck size={12} /> MPC Keyless Secured
            </span>
          </div>

          {/* Primary JPY Currency Display */}
          <div className="flex items-baseline gap-2 my-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono">
              {hideBalance ? "••••••••" : `¥${Math.round(totalBalanceJPY).toLocaleString('ja-JP')}`}
            </h1>
            <span className="text-xs text-[#848E9C] font-semibold">JPY</span>
          </div>

          {/* 24h PnL Display in JPY */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#848E9C]">24h P&L:</span>
            <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md ${
              pnl24h.jpy >= 0 ? 'bg-[#03A66D]/10 text-[#03A66D]' : 'bg-[#CF304A]/10 text-[#CF304A]'
            }`}>
              {pnl24h.jpy >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>
                {pnl24h.jpy >= 0 ? '+' : ''}¥{Math.abs(Math.round(pnl24h.jpy)).toLocaleString('ja-JP')} ({pnl24h.pct.toFixed(2)}%)
              </span>
            </div>
          </div>

          {/* Core Action Grid (Send, Receive, Swap, Buy/Deposit) */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <button 
              onClick={() => setModalType('send')}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2B313A] group-hover:bg-[#F0B90B] text-white group-hover:text-[#0B0E11] flex items-center justify-center mb-1.5 transition-all shadow-md">
                <ArrowUpRight size={22} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-white">Send</span>
            </button>

            <button 
              onClick={() => setModalType('receive')}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2B313A] group-hover:bg-[#03A66D] text-white flex items-center justify-center mb-1.5 transition-all shadow-md">
                <ArrowDownLeft size={22} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-white">Receive</span>
            </button>

            <button 
              onClick={() => setModalType('swap')}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2B313A] group-hover:bg-[#F0B90B] text-white group-hover:text-[#0B0E11] flex items-center justify-center mb-1.5 transition-all shadow-md">
                <ArrowLeftRight size={20} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-white">Swap</span>
            </button>

            <button 
              onClick={() => setModalType('deposit')}
              className="flex flex-col items-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#2B313A] group-hover:bg-[#363D47] text-white flex items-center justify-center mb-1.5 transition-all shadow-md border border-[#363D47]">
                <Plus size={22} className="stroke-[2.5]" />
              </div>
              <span className="text-xs font-medium text-white">Deposit</span>
            </button>
          </div>
        </div>

        {/* Main Content Area: Tabs & Views */}
        <div className="p-4 flex-grow flex flex-col bg-[#181A20]">
          
          {/* Navigation Tabs Header */}
          <div className="flex items-center justify-between border-b border-[#2B313A] pb-2 mb-3">
            <div className="flex gap-5">
              {[
                { id: 'assets', label: 'Crypto Assets' },
                { id: 'nfts', label: 'NFTs' },
                { id: 'defi', label: 'Earn / DeFi' },
                { id: 'history', label: 'Activity' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-bold pb-2 -mb-2 relative transition-colors ${
                    activeTab === tab.id ? 'text-[#F0B90B]' : 'text-[#848E9C] hover:text-white'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F0B90B] rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Search Input for Assets */}
            {activeTab === 'assets' && (
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#848E9C]" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0B0E11] border border-[#2B313A] text-xs text-white rounded-lg pl-7 pr-2 py-1 focus:outline-none focus:border-[#F0B90B] w-24 sm:w-32 transition-all"
                />
              </div>
            )}
          </div>

          {/* TAB 1: CRYPTO ASSETS LIST */}
          {activeTab === 'assets' && (
            <div className="space-y-1">
              {filteredTokens.length === 0 ? (
                <div className="text-center py-10 text-[#848E9C] text-xs">No matching assets found</div>
              ) : (
                filteredTokens.map(token => {
                  const tokenAmount = (token.balanceJPY / token.priceJPY).toFixed(4);
                  const isPos = token.change24h >= 0;
                  return (
                    <div 
                      key={token.id}
                      onClick={() => setModalType('send')}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#2B313A]/50 transition-colors border border-transparent hover:border-[#2B313A] cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0B0E11] border border-[#2B313A] flex items-center justify-center text-lg shadow-inner">
                          {token.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white text-sm">{token.symbol}</span>
                            <span className="text-[10px] bg-[#2B313A] text-[#848E9C] px-1.5 py-0.2 rounded font-mono">
                              {token.chain}
                            </span>
                          </div>
                          <div className="text-xs text-[#848E9C]">{token.name}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        {/* Primary Balance Display in JPY */}
                        <div className="font-bold text-white text-sm font-mono">
                          {hideBalance ? "••••" : `¥${Math.round(token.balanceJPY).toLocaleString('ja-JP')}`}
                        </div>
                        <div className="flex items-center justify-end gap-1.5 text-xs">
                          <span className="text-[#848E9C] font-mono">
                            {hideBalance ? "••••" : `${tokenAmount} ${token.symbol}`}
                          </span>
                          <span className={`text-[11px] font-medium ${isPos ? 'text-[#03A66D]' : 'text-[#CF304A]'}`}>
                            {isPos ? '+' : ''}{token.change24h}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: NFT GALLERY */}
          {activeTab === 'nfts' && (
            <div className="grid grid-cols-2 gap-3 py-1">
              {INITIAL_NFTS.map(nft => (
                <div key={nft.id} className="bg-[#0B0E11] border border-[#2B313A] rounded-xl overflow-hidden group">
                  <div className="h-32 overflow-hidden relative">
                    <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute top-2 right-2 bg-[#0B0E11]/80 backdrop-blur px-2 py-0.5 rounded text-[10px] text-[#F0B90B] font-mono font-bold">
                      ¥{nft.valueJPY.toLocaleString('ja-JP')}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <div className="text-[10px] text-[#848E9C] font-bold">{nft.collection}</div>
                    <div className="text-xs font-bold text-white truncate">{nft.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: DEFI / EARN */}
          {activeTab === 'defi' && (
            <div className="space-y-2 py-1">
              {DEFI_POSITIONS.map(pos => (
                <div key={pos.id} className="p-3 bg-[#0B0E11] border border-[#2B313A] rounded-xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-white">{pos.protocol}</span>
                    <span className="text-xs font-bold text-[#03A66D] bg-[#03A66D]/10 px-2 py-0.5 rounded">
                      APY {pos.APY}
                    </span>
                  </div>
                  <div className="text-xs text-[#848E9C] mb-2">{pos.pool}</div>
                  <div className="flex justify-between text-xs pt-2 border-t border-[#2B313A]">
                    <div>
                      <span className="text-[#848E9C]">Staked: </span>
                      <span className="text-white font-mono">¥{pos.stakedJPY.toLocaleString('ja-JP')}</span>
                    </div>
                    <div>
                      <span className="text-[#848E9C]">Earned: </span>
                      <span className="text-[#F0B90B] font-mono">¥{pos.earnedJPY.toLocaleString('ja-JP')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: TRANSACTION HISTORY IN JPY */}
          {activeTab === 'history' && (
            <div className="space-y-2 py-1">
              <div className="flex gap-1.5 mb-3">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'send', label: 'Send' },
                  { id: 'receive', label: 'Receive' },
                  { id: 'swap', label: 'Swap' }
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setHistoryFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      historyFilter === f.id ? 'bg-[#F0B90B] text-[#0B0E11]' : 'bg-[#0B0E11] text-[#848E9C] hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {filteredActivity.length === 0 ? (
                <div className="text-center py-8 text-[#848E9C] text-xs">No transaction history available</div>
              ) : (
                filteredActivity.map(tx => (
                  <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E11] border border-[#2B313A]">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        tx.type === 'send' ? 'bg-[#CF304A]/10 text-[#CF304A]' :
                        tx.type === 'receive' ? 'bg-[#03A66D]/10 text-[#03A66D]' :
                        'bg-[#F0B90B]/10 text-[#F0B90B]'
                      }`}>
                        {tx.type === 'send' && <ArrowUpRight size={16} />}
                        {tx.type === 'receive' && <ArrowDownLeft size={16} />}
                        {tx.type === 'swap' && <ArrowLeftRight size={14} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white capitalize">
                          {tx.type}
                        </div>
                        <div className="text-[10px] text-[#848E9C]">{tx.time}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-white">
                        {tx.type === 'send' && `-¥${Math.round(tx.amountJPY).toLocaleString('ja-JP')} (${tx.tokenAmount} ${tx.symbol})`}
                        {tx.type === 'receive' && `+¥${Math.round(tx.amountJPY).toLocaleString('ja-JP')} (${tx.tokenAmount} ${tx.symbol})`}
                        {tx.type === 'swap' && `¥${Math.round(tx.amountJPYFrom).toLocaleString('ja-JP')} (${tx.symbolFrom} → ${tx.symbolTo})`}
                      </div>
                      <span className="text-[9px] text-[#03A66D] bg-[#03A66D]/10 px-1.5 py-0.2 rounded font-medium">
                        {tx.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Bottom Dock Navigation */}
        <nav className="bg-[#0B0E11] border-t border-[#2B313A] px-4 py-2.5 flex items-center justify-around text-[10px] font-medium text-[#848E9C]">
          <button 
            onClick={() => setBottomNav('wallet')}
            className={`flex flex-col items-center gap-1 ${bottomNav === 'wallet' ? 'text-[#F0B90B]' : 'hover:text-white'}`}
          >
            <Wallet size={18} />
            <span>Wallet</span>
          </button>

          <button 
            onClick={() => {
              setBottomNav('swap');
              setModalType('swap');
            }}
            className={`flex flex-col items-center gap-1 ${bottomNav === 'swap' ? 'text-[#F0B90B]' : 'hover:text-white'}`}
          >
            <ArrowLeftRight size={18} />
            <span>Swap</span>
          </button>

          <button 
            onClick={() => {
              setBottomNav('earn');
              setActiveTab('defi');
            }}
            className={`flex flex-col items-center gap-1 ${bottomNav === 'earn' ? 'text-[#F0B90B]' : 'hover:text-white'}`}
          >
            <PieChart size={18} />
            <span>Earn</span>
          </button>

          <button 
            onClick={() => {
              setBottomNav('discover');
              showToast("dApp Browser Launched");
            }}
            className={`flex flex-col items-center gap-1 ${bottomNav === 'discover' ? 'text-[#F0B90B]' : 'hover:text-white'}`}
          >
            <Compass size={18} />
            <span>Discover</span>
          </button>
        </nav>

      </div>

      {/* MODAL 1: SEND TRANSACTION MODAL */}
      {modalType === 'send' && (
        <SendModal 
          tokens={tokens} 
          onClose={() => setModalType(null)} 
          onSuccess={(data) => {
            // Deduct exact JPY balance (e.g. ¥30,000 sent from ¥50,000 BNB -> ¥20,000 remaining)
            setTokens(prev => prev.map(t => {
              if (t.symbol === data.token.symbol) {
                const updatedBalanceJPY = Math.max(0, t.balanceJPY - data.amountJPY);
                return { ...t, balanceJPY: updatedBalanceJPY };
              }
              return t;
            }));

            // Record transaction in history
            setTransactions(prev => [{
              id: 'tx_' + Date.now(),
              type: 'send',
              symbol: data.token.symbol,
              amountJPY: data.amountJPY,
              tokenAmount: (data.amountJPY / data.token.priceJPY).toFixed(4),
              address: data.recipient,
              time: 'Just now',
              status: 'Completed',
              hash: '0x' + Math.random().toString(16).substr(2, 8) + '...'
            }, ...prev]);

            showToast(`Successfully sent ¥${Math.round(data.amountJPY).toLocaleString('ja-JP')} of ${data.token.symbol}!`);
            setModalType(null);
          }}
        />
      )}

      {/* MODAL 2: RECEIVE QR MODAL */}
      {modalType === 'receive' && (
        <ReceiveModal 
          tokens={tokens} 
          networks={NETWORKS}
          walletAddress={WALLET_ADDRESS}
          onClose={() => setModalType(null)} 
          showToast={showToast}
        />
      )}

      {/* MODAL 3: SWAP MODAL */}
      {modalType === 'swap' && (
        <SwapModal 
          tokens={tokens} 
          onClose={() => setModalType(null)} 
          onSuccess={(swapData) => {
            setTokens(prev => prev.map(t => {
              if (t.symbol === swapData.fromToken.symbol) {
                return { ...t, balanceJPY: Math.max(0, t.balanceJPY - swapData.fromAmountJPY) };
              }
              if (t.symbol === swapData.toToken.symbol) {
                return { ...t, balanceJPY: t.balanceJPY + swapData.fromAmountJPY };
              }
              return t;
            }));

            setTransactions(prev => [{
              id: 'tx_' + Date.now(),
              type: 'swap',
              symbolFrom: swapData.fromToken.symbol,
              amountJPYFrom: swapData.fromAmountJPY,
              symbolTo: swapData.toToken.symbol,
              amountJPYTo: swapData.fromAmountJPY,
              time: 'Just now',
              status: 'Completed',
              hash: '0x' + Math.random().toString(16).substr(2, 8) + '...'
            }, ...prev]);

            showToast(`Swapped ¥${Math.round(swapData.fromAmountJPY).toLocaleString('ja-JP')} to ${swapData.toToken.symbol}!`);
            setModalType(null);
          }}
        />
      )}

      {/* MODAL 4: DEPOSIT OPTIONS MODAL */}
      {modalType === 'deposit' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181A20] border border-[#2B313A] rounded-2xl w-full max-w-sm overflow-hidden p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-white text-base">Deposit / Buy Crypto</h3>
              <button onClick={() => setModalType(null)} className="text-[#848E9C] hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setModalType('receive')}
              className="w-full bg-[#2B313A] hover:bg-[#363D47] p-4 rounded-xl text-left flex items-center justify-between transition-all"
            >
              <div>
                <div className="font-bold text-white text-sm">Deposit Crypto</div>
                <div className="text-xs text-[#848E9C]">Transfer from Binance Exchange or Web3 address</div>
              </div>
              <ChevronRight size={18} className="text-[#848E9C]" />
            </button>

            <button 
              onClick={() => {
                showToast("Opening JPY Fiat Payment Gateway...");
                setModalType(null);
              }}
              className="w-full bg-[#2B313A] hover:bg-[#363D47] p-4 rounded-xl text-left flex items-center justify-between transition-all"
            >
              <div>
                <div className="font-bold text-white text-sm">Buy with Japanese Yen (JPY)</div>
                <div className="text-xs text-[#848E9C]">Credit Card, Apple Pay, Bank Transfer</div>
              </div>
              <ChevronRight size={18} className="text-[#848E9C]" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

function SendModal({ tokens, onClose, onSuccess }) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]); // Default BNB (¥50,000 balance)
  const [recipient, setRecipient] = useState('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
  const [amountInputJPY, setAmountInputJPY] = useState('30000'); // Pre-set to ¥30,000 to leave exactly ¥20,000 BNB
  const [gasSpeed, setGasSpeed] = useState('standard');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  const gasFeeJPY = gasSpeed === 'fast' ? 300 : gasSpeed === 'standard' ? 150 : 80;

  const handleNext = () => {
    setError('');
    if (!recipient.startsWith('0x') || recipient.length < 10) {
      setError('Please enter a valid recipient wallet address (0x...)');
      return;
    }
    const numJPY = parseFloat(amountInputJPY);
    if (isNaN(numJPY) || numJPY <= 0) {
      setError('Please enter a valid JPY amount');
      return;
    }
    if (numJPY > selectedToken.balanceJPY) {
      setError('Amount exceeds current token balance');
      return;
    }
    setStep(2);
  };

  const handleConfirm = () => {
    setStep(3); // MPC Signing Animation State
    setTimeout(() => {
      onSuccess({ 
        token: selectedToken, 
        recipient, 
        amountJPY: parseFloat(amountInputJPY) 
      });
    }, 2000);
  };

  const calculateTokenAmount = (jpyVal) => {
    const parsed = parseFloat(jpyVal);
    if (isNaN(parsed) || parsed <= 0) return '0.0000';
    return (parsed / selectedToken.priceJPY).toFixed(4);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181A20] border border-[#2B313A] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[#2B313A] flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <Send size={16} className="text-[#F0B90B]" />
            Send Asset (JPY)
          </h3>
          <button onClick={onClose} className="text-[#848E9C] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4">
          {step === 1 && (
            <div className="space-y-3">
              {/* Token Picker */}
              <div>
                <label className="text-xs text-[#848E9C] mb-1 block">Select Asset</label>
                <select
                  value={selectedToken.id}
                  onChange={(e) => setSelectedToken(tokens.find(t => t.id === e.target.value))}
                  className="w-full bg-[#0B0E11] border border-[#2B313A] text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#F0B90B]"
                >
                  {tokens.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.symbol} ({t.chain}) - Balance: ¥{Math.round(t.balanceJPY).toLocaleString('ja-JP')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Recipient Address */}
              <div>
                <label className="text-xs text-[#848E9C] mb-1 block">Recipient Address</label>
                <input
                  type="text"
                  placeholder="Enter or paste 0x address"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full bg-[#0B0E11] border border-[#2B313A] text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-[#F0B90B] font-mono"
                />
              </div>

              {/* Amount Input in JPY with preset / MAX buttons */}
              <div>
                <div className="flex justify-between text-xs text-[#848E9C] mb-1">
                  <span>Send Amount (JPY)</span>
                  <div className="flex gap-2">
                    {selectedToken.symbol === 'BNB' && (
                      <button 
                        onClick={() => setAmountInputJPY('30000')}
                        className="text-[#F0B90B] font-bold hover:underline"
                      >
                        Send ¥30,000
                      </button>
                    )}
                    <button 
                      onClick={() => setAmountInputJPY(selectedToken.balanceJPY.toString())}
                      className="text-[#F0B90B] font-bold hover:underline"
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#848E9C] font-bold">
                    ¥
                  </span>
                  <input
                    type="number"
                    placeholder="30000"
                    value={amountInputJPY}
                    onChange={(e) => setAmountInputJPY(e.target.value)}
                    className="w-full bg-[#0B0E11] border border-[#2B313A] text-white rounded-xl p-2.5 pl-7 pr-16 text-xs focus:outline-none focus:border-[#F0B90B] font-mono"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#848E9C] font-bold">
                    JPY
                  </span>
                </div>
                {/* Converted Token Amount Preview */}
                <div className="text-[11px] text-[#848E9C] mt-1 text-right font-mono">
                  ≈ {calculateTokenAmount(amountInputJPY)} {selectedToken.symbol}
                </div>
              </div>

              {/* Gas Speed Selector in JPY */}
              <div>
                <label className="text-xs text-[#848E9C] mb-1 block">Network Fee (Gas)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'slow', label: 'Slow', fee: '¥80 JPY' },
                    { id: 'standard', label: 'Standard', fee: '¥150 JPY' },
                    { id: 'fast', label: 'Fast', fee: '¥300 JPY' },
                  ].map(s => (
                    <button
                      key={s.id}
                      onClick={() => setGasSpeed(s.id)}
                      className={`p-2 rounded-lg border text-center text-[10px] ${
                        gasSpeed === s.id ? 'border-[#F0B90B] bg-[#F0B90B]/10 text-white' : 'border-[#2B313A] bg-[#0B0E11] text-[#848E9C]'
                      }`}
                    >
                      <div className="font-bold">{s.label}</div>
                      <div>{s.fee}</div>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-[#CF304A]/10 text-[#CF304A] p-2 rounded-lg text-xs flex items-center gap-1.5">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full bg-[#F0B90B] hover:bg-[#d9a60a] text-[#0B0E11] font-bold py-2.5 rounded-xl text-xs transition-all mt-2"
              >
                Next
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="bg-[#0B0E11] p-3 rounded-xl border border-[#2B313A] text-center">
                <div className="text-[10px] text-[#848E9C]">Sending Amount</div>
                <div className="text-2xl font-bold text-white font-mono my-0.5">
                  ¥{Math.round(parseFloat(amountInputJPY)).toLocaleString('ja-JP')} JPY
                </div>
                <div className="text-xs text-[#848E9C] font-mono">
                  ≈ {calculateTokenAmount(amountInputJPY)} {selectedToken.symbol}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-[#2B313A]">
                  <span className="text-[#848E9C]">Recipient</span>
                  <span className="font-mono text-white">
                    {recipient.slice(0, 8)}...{recipient.slice(-6)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2B313A]">
                  <span className="text-[#848E9C]">Network Fee</span>
                  <span className="text-white font-mono">¥{gasFeeJPY} JPY</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#2B313A]">
                  <span className="text-[#848E9C]">Estimated Remaining {selectedToken.symbol}</span>
                  <span className="text-[#F0B90B] font-mono font-bold">
                    ¥{Math.round(Math.max(0, selectedToken.balanceJPY - parseFloat(amountInputJPY))).toLocaleString('ja-JP')} JPY
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep(1)}
                  className="w-1/2 bg-[#2B313A] text-white font-bold py-2.5 rounded-xl text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handleConfirm}
                  className="w-1/2 bg-[#F0B90B] text-[#0B0E11] font-bold py-2.5 rounded-xl text-xs"
                >
                  Confirm & Send
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="py-6 text-center space-y-3">
              <div className="w-10 h-10 border-4 border-[#F0B90B] border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-white font-bold text-xs">Binance MPC Key Share Signing...</div>
              <div className="text-[10px] text-[#848E9C]">Broadcasting transaction to blockchain network</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function ReceiveModal({ tokens, networks, walletAddress, onClose, showToast }) {
  const [selectedToken, setSelectedToken] = useState(tokens[0]);
  const [selectedNet, setSelectedNet] = useState(networks[0]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181A20] border border-[#2B313A] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        
        <div className="p-4 border-b border-[#2B313A] flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <QrCode size={16} className="text-[#03A66D]" />
            Receive Crypto
          </h3>
          <button onClick={onClose} className="text-[#848E9C] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 text-center space-y-4">
          <div className="grid grid-cols-2 gap-2 text-left">
            <div>
              <label className="text-[10px] text-[#848E9C] block mb-1">Token</label>
              <select
                value={selectedToken.id}
                onChange={(e) => setSelectedToken(tokens.find(t => t.id === e.target.value))}
                className="w-full bg-[#0B0E11] border border-[#2B313A] text-white rounded-lg p-2 text-xs"
              >
                {tokens.map(t => (
                  <option key={t.id} value={t.id}>{t.symbol}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-[#848E9C] block mb-1">Network</label>
              <select
                value={selectedNet.id}
                onChange={(e) => setSelectedNet(networks.find(n => n.id === e.target.value))}
                className="w-full bg-[#0B0E11] border border-[#2B313A] text-white rounded-lg p-2 text-xs"
              >
                {networks.map(n => (
                  <option key={n.id} value={n.id}>{n.shortName}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dynamic QR Code Box with Logo Overlay */}
          <div className="bg-white p-3 rounded-2xl w-44 h-44 mx-auto flex items-center justify-center relative border-2 border-[#2B313A]">
            <svg viewBox="0 0 100 100" className="w-full h-full fill-black">
              <path d="M0,0 h30 v30 h-30 z M10,10 h10 v10 h-10 z M70,0 h30 v30 h-30 z M80,10 h10 v10 h-10 z M0,70 h30 v30 h-30 z M10,80 h10 v10 h-10 z M40,10 h10 v10 h-10 z M50,40 h20 v20 h-20 z M10,40 h20 v20 h-20 z M70,70 h20 v20 h-20 z M40,70 h20 v10 h-20 z" />
            </svg>
            <div className="absolute w-8 h-8 bg-[#F0B90B] rounded-full flex items-center justify-center text-xs font-bold text-[#0B0E11] border-2 border-white shadow">
              {selectedToken.icon}
            </div>
          </div>

          <div className="bg-[#0B0E11] p-2.5 rounded-xl border border-[#2B313A] text-left">
            <div className="text-[10px] text-[#848E9C]">Deposit Address ({selectedNet.nativeToken})</div>
            <div className="text-xs font-mono text-white break-all">{walletAddress}</div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(walletAddress);
              showToast("Deposit address copied to clipboard");
            }}
            className="w-full bg-[#03A66D] hover:bg-[#028a5a] text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
          >
            <Copy size={14} />
            Copy Address
          </button>

          <div className="bg-[#F0B90B]/10 border border-[#F0B90B]/20 p-2.5 rounded-xl text-[10px] text-[#F0B90B] text-left flex items-start gap-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>Send only {selectedToken.symbol} to this address using the {selectedNet.name} network. Sending other assets may result in permanent loss.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function SwapModal({ tokens, onClose, onSuccess }) {
  const [fromToken, setFromToken] = useState(tokens[0]); // BNB
  const [toToken, setToToken] = useState(tokens[1]);     // USDT
  const [fromAmountJPY, setFromAmountJPY] = useState('10000');

  const estToTokenAmount = useMemo(() => {
    const num = parseFloat(fromAmountJPY);
    if (isNaN(num) || num <= 0) return '0.00';
    return (num / toToken.priceJPY).toFixed(4);
  }, [fromAmountJPY, toToken]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#181A20] border border-[#2B313A] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
        
        <div className="p-4 border-b border-[#2B313A] flex items-center justify-between">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <ArrowLeftRight size={16} className="text-[#F0B90B]" />
            Binance Swap (Instant JPY Math)
          </h3>
          <button onClick={onClose} className="text-[#848E9C] hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Payment Card */}
          <div className="bg-[#0B0E11] p-3 rounded-xl border border-[#2B313A]">
            <div className="flex justify-between text-[10px] text-[#848E9C] mb-1">
              <span>You Pay (JPY)</span>
              <span>Balance: ¥{Math.round(fromToken.balanceJPY).toLocaleString('ja-JP')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-white font-mono text-base">¥</span>
              <input
                type="number"
                placeholder="10000"
                value={fromAmountJPY}
                onChange={(e) => setFromAmountJPY(e.target.value)}
                className="w-full bg-transparent text-white font-mono text-base focus:outline-none"
              />
              <select
                value={fromToken.id}
                onChange={(e) => setFromToken(tokens.find(t => t.id === e.target.value))}
                className="bg-[#2B313A] text-white text-xs font-bold rounded-lg px-2 py-1"
              >
                {tokens.map(t => (
                  <option key={t.id} value={t.id}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Toggle Arrow Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <button 
              onClick={() => {
                const temp = fromToken;
                setFromToken(toToken);
                setToToken(temp);
              }}
              className="bg-[#2B313A] border border-[#363D47] p-1.5 rounded-full text-[#F0B90B] hover:scale-110 transition-transform"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          {/* Receive Card */}
          <div className="bg-[#0B0E11] p-3 rounded-xl border border-[#2B313A]">
            <div className="text-[10px] text-[#848E9C] mb-1">You Receive (Estimated)</div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                disabled
                value={`${estToTokenAmount} ${toToken.symbol}`}
                className="w-full bg-transparent text-[#03A66D] font-mono text-base focus:outline-none"
              />
              <select
                value={toToken.id}
                onChange={(e) => setToToken(tokens.find(t => t.id === e.target.value))}
                className="bg-[#2B313A] text-white text-xs font-bold rounded-lg px-2 py-1"
              >
                {tokens.map(t => (
                  <option key={t.id} value={t.id}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px] text-[#848E9C] flex justify-between px-1">
            <span>Slippage Tolerance</span>
            <span className="text-white font-mono">0.1%</span>
          </div>

          <button
            onClick={() => {
              const val = parseFloat(fromAmountJPY);
              if (val && val <= fromToken.balanceJPY) {
                onSuccess({ 
                  fromToken, 
                  toToken, 
                  fromAmountJPY: val 
                });
              }
            }}
            disabled={!fromAmountJPY || parseFloat(fromAmountJPY) <= 0 || parseFloat(fromAmountJPY) > fromToken.balanceJPY}
            className="w-full bg-[#F0B90B] disabled:bg-[#2B313A] disabled:text-[#848E9C] text-[#0B0E11] font-bold py-2.5 rounded-xl text-xs transition-all mt-1"
          >
            {parseFloat(fromAmountJPY) > fromToken.balanceJPY ? 'Insufficient Balance' : 'Confirm Swap'}
          </button>
        </div>

      </div>
    </div>
  );
}