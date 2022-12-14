import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { BrowserRouter } from 'react-router-dom';

import Router from '../components/Router';
// import contractAddr from '../../../contract/config/contract-address.json';
import contractJson from '../../../contract/config/DrinkNFT.json';
import services from '../api';

// const { DrinkNFT: drinkNftAddr } = contractAddr;
const { abi: contractABI } = contractJson;

const getAddress = async () => {
  if (!window.ethereum) throw new Error('No wallet found!');
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const address = await signer.getAddress();
  return address;
};

const getNFTs = async (addr, contractAddrList, sigs) => {
  if (!ethers.utils.isAddress(addr)) return [];
  if (!window.ethereum) throw new Error('No wallet found!');
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  let allList = contractAddrList.map(async (contractAddr) => {
    const contract = new ethers.Contract(contractAddr, contractABI, provider);
    const nftName = await contract.name();
    const nftNum = await contract.balanceOf(addr);
    const imageUri = await contract.getImageURI();
    const tasks = [];
    for (let i = 0; i < nftNum; i += 1) {
      tasks.push(contract.tokenOfOwnerByIndex(addr, i));
    }
    const nftIds = await Promise.all(tasks);
    return nftIds.map((tokenId) => ({
      id: `${contractAddr}/${tokenId.toString()}`,
      name: `${nftName} #${tokenId.toString()}`,
      used: sigs.some((sig) => ((sig.contractAddress === contractAddr)
        && (Number(sig.tokenId) === Number(tokenId)))),
      imageUri,
    }));
  });
  allList = await Promise.all(allList);
  return allList.flat(1);
};

function Root() {
  const [addr, setAddr] = useState('Address');
  const [nftList, setNftList] = useState(undefined);

  useEffect(() => {
    const getAddr = async () => {
      const newAddr = await getAddress();
      const contracts = await services.contracts.getAll();
      const contractAddrList = contracts.data.map(({ address }) => address);
      const sigs = await services.signatures.getAddrSig(newAddr);
      if (newAddr !== addr) {
        setAddr(newAddr);
        try {
          setNftList(await getNFTs(newAddr, contractAddrList, sigs.data));
        } catch (err) {
          console.log(err);
          setNftList([]);
        }
      }
    };
    getAddr();
  }, []);

  return (
    <BrowserRouter
      basename={process.env.NODE_ENV === 'production' ? '' : ''}
    >
      <Rootwrapper>
        <Router address={addr} nftList={nftList} />
      </Rootwrapper>
    </BrowserRouter>
  );
}

export default Root;

const Rootwrapper = styled.div`
  width: inherit;
  height: inherit;
  text-align: center;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  position: relative;
  background-color: #6b0600;
`;
