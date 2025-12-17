'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/utils/app-store';
import { useToast } from '@/contexts/ToastContext';
import Trash from '@/icons/Trash';
import MainLayout from '../layout/MainLayout';
import MyCard from '../custom/MyCard';

export default function WalletTodo() {
  const showToast = useToast();
  const { wallets, addWallet, removeWallet, selectedWalletId, setSelectedId } = useAppStore();
  const [newWallet, setNewWallet] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Validate XLM Wallet Address
  const isValidStellarAddress = (address: string) => /^G[A-Z2-7]{55}$/.test(address);

  // Handle Add Wallet
  const handleAddWallet = () => {
    if (!isValidStellarAddress(newWallet)) {
      showToast('Invalid Stellar wallet address!', 'error');
      return;
    }

    if (wallets.some(wallet => wallet.address === newWallet)) {
      showToast('Wallet address already added!', 'error');
      return;
    }

    try {
      addWallet(newWallet);
    } catch (e: any) {
      showToast(e.toString(), 'error');
    }
    setNewWallet('');
    setIsModalOpen(false);
    showToast('Wallet address added!', 'success');
  };

  // Handle Select Wallet
  const handleSelectWallet = (walletId: string) => {
    setSelectedId(selectedWalletId === walletId ? null : walletId);
  };

  return (
    <MainLayout title="Wallet Management">
        <div className="relative">
          {/* KuCoin Style Header */}
          <MyCard className="mb-4">
            <div className="border-b border-gray-100 pb-4 mb-4">
              <p className="text-sm text-gray-200">Manage your Stellar wallet addresses</p>
            </div>
            
            {/* Add Wallet Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full btn btn-outline btn-success"
            >
              + Add New Wallet
            </button>
          </MyCard>

          {/* Wallet List */}
          {wallets.length > 0 ? (
            <MyCard p={0} className="overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <h4 className="text-sm font-medium text-gray-300">Your Wallets ({wallets.length})</h4>
              </div>
              
              <div className="divide-y divide-gray-200">
                {wallets.map((wallet, index) => (
                  <div key={wallet.id} className="p-4">
                    <div className="flex items-center justify-between">
                      {/* Wallet Info */}
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Radio Button */}
                        <button
                          onClick={() => handleSelectWallet(wallet.id)}
                          className="flex items-center space-x-3 flex-1 text-left"
                        >
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            {selectedWalletId === wallet.id && (
                              <div className="w-2.5 h-2.5 bg-success rounded-full"></div>
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-300">
                              Wallet #{index + 1}
                            </div>
                            <div className="text-xs text-gray-300 font-mono">
                              {wallet.address.length > 20
                                ? `${wallet.address.slice(0, 10)}...${wallet.address.slice(-10)}`
                                : wallet.address}
                            </div>
                            {selectedWalletId === wallet.id && (
                              <div className="text-xs text-success font-medium mt-1">
                                 Active Wallet
                               </div>
                            )}
                          </div>
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        onClick={() => removeWallet(wallet.id)}
                        className="ml-3 p-2 text-success hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete wallet"
                      >
                        <Trash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </MyCard>
          ) : (
            <MyCard className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">No wallets added</h3>
              <p className="text-gray-200 mb-4">Add your first Stellar wallet to get started</p>
               <button
                 onClick={() => setIsModalOpen(true)}
                 className="btn btn-outline btn-success"
               >
                 Add Wallet
               </button>
            </MyCard>
          )}
        </div>

      {/* Wallet Add Modal */}
      {isModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-panel-glass shadow-2xl border-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-300">Add New Wallet</h3>
                <p className="text-sm text-gray-200 mt-1">Connect your Stellar wallet to start trading</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Stellar Wallet Address
                </label>
                <input
                  id="wallet-address"
                  type="text"
                  placeholder="Enter Stellar wallet address"
                  value={newWallet}
                  onChange={(e) => setNewWallet(e.target.value)}
                  className="ku-input ku-input-bordered w-full"
                />
                <p className="text-xs text-gray-300 mt-2">
                  <span className="font-medium">Format:</span> Starts with <b>G</b> and followed by 55 characters
                </p>
              </div>

              {/* Security Notice */}
              <div className="text-success bg-opacity-10 border border-opacity-20 rounded-lg p-4">
                 <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-success mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <div>
                    <h4 className="text-sm font-semibold text-success">Security Notice</h4>
                    <p className="text-xs text-success opacity-80 mt-1">
                       Only add wallets you own. We never ask for your private keys.
                     </p>
                   </div>
                 </div>
               </div>
            </div>

            {/* Modal Actions */}
            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 btn btn-outline btn-error"
              >
                Cancel
              </button>
                <button
                  onClick={handleAddWallet}
                  className="flex-1 btn btn-outline btn-success"
                  disabled={!newWallet.trim()}
                >
                  Add Wallet
                </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
