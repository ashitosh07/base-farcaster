// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FlexCard
 * @dev ERC-721 NFT contract for FlexCard minting on Base
 */
contract FlexCard is ERC721, ERC721URIStorage, Ownable {
    uint256 private _tokenIdCounter;
    
    // Minter role
    mapping(address => bool) public minters;
    
    // Events
    event FlexCardMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    
    modifier onlyMinter() {
        require(minters[msg.sender] || msg.sender == owner(), "Not authorized to mint");
        _;
    }
    
    constructor(string memory name, string memory symbol) 
        ERC721(name, symbol) 
        Ownable(msg.sender) 
    {
        // Start token IDs at 1
        _tokenIdCounter = 1;
    }
    
    /**
     * @dev Mint a new FlexCard NFT
     * @param to Address to mint the NFT to
     * @param uri IPFS URI for the token metadata
     * @return tokenId The ID of the newly minted token
     */
    function mintTo(address to, string memory uri) 
        external 
        onlyMinter 
        returns (uint256) 
    {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit FlexCardMinted(tokenId, to, uri);
        
        return tokenId;
    }
    
    /**
     * @dev Add a new minter
     * @param minter Address to grant minting privileges
     */
    function addMinter(address minter) external onlyOwner {
        minters[minter] = true;
        emit MinterAdded(minter);
    }
    
    /**
     * @dev Remove a minter
     * @param minter Address to revoke minting privileges
     */
    function removeMinter(address minter) external onlyOwner {
        minters[minter] = false;
        emit MinterRemoved(minter);
    }
    
    /**
     * @dev Get the current token ID counter
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter;
    }
    
    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
    
    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}