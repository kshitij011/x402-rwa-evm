// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @title RealEstateTokenization (ERC1155) - Property shares tokenization platform.
/// @notice Each property is a token id. Shares are fungible per property id.
/// Platform deployer is the platform owner (can manage KYC). Property creator becomes that property's admin.
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RealEstateTokenization is ERC1155, ERC1155Supply, Ownable {
    struct PropertyConfig {
        uint64 propertyId;
        address admin;
        uint256 pricePerShare;
        uint256 maxShares;
        uint256 sharesSold;
        bool exists;
    }

    mapping(uint64 => PropertyConfig) public properties;
    mapping(address => bool) public kycVerified;

    event PropertyInitialized(
        uint64 indexed propertyId,
        address indexed admin,
        uint256 pricePerShare,
        uint256 maxShares
    );
    event KycApproved(address indexed user);
    event KycRevoked(address indexed user);
    event SharesBought(
        uint64 indexed propertyId,
        address indexed buyer,
        address indexed receiver,
        uint256 amount,
        uint256 totalPaid
    );
    event CapitalWithdrawn(
        uint64 indexed propertyId,
        address indexed admin,
        uint256 amount
    );

    constructor(string memory uri) ERC1155(uri) Ownable(msg.sender) {}

    modifier propertyExists(uint64 propertyId) {
        require(properties[propertyId].exists, "Property does not exist");
        _;
    }

    modifier onlyPropertyAdmin(uint64 propertyId) {
        require(
            properties[propertyId].admin == msg.sender,
            "Only property admin"
        );
        _;
    }

    function initializeProperty(
        uint64 propertyId,
        uint256 pricePerShare,
        uint256 maxShares
    ) external onlyOwner {
        require(!properties[propertyId].exists, "Property already initialized");
        require(maxShares > 0, "maxShares must be > 0");
        require(pricePerShare > 0, "pricePerShare must be > 0");

        properties[propertyId] = PropertyConfig({
            propertyId: propertyId,
            admin: msg.sender,
            pricePerShare: pricePerShare,
            maxShares: maxShares,
            sharesSold: 0,
            exists: true
        });

        emit PropertyInitialized(
            propertyId,
            msg.sender,
            pricePerShare,
            maxShares
        );
    }

    function approveUser(address user) external onlyOwner {
        require(user != address(0), "Zero address");
        kycVerified[user] = true;
        emit KycApproved(user);
    }

    function revokeUser(address user) external onlyOwner {
        require(user != address(0), "Zero address");
        kycVerified[user] = false;
        emit KycRevoked(user);
    }

    function buyShares(
        uint64 propertyId,
        address receiver,
        uint256 amount,
        uint256 pricePaid
    ) external propertyExists(propertyId) onlyOwner {
        require(receiver != address(0), "receiver zero address");
        require(amount > 0, "amount > 0");
        require(kycVerified[receiver], "Receiver not KYC verified");

        PropertyConfig storage cfg = properties[propertyId];

        uint256 newSupply = cfg.sharesSold + amount;
        require(newSupply <= cfg.maxShares, "Supply limit reached");

        _mint(receiver, propertyId, amount, "");

        cfg.sharesSold = newSupply;

        emit SharesBought(propertyId, msg.sender, receiver, amount, pricePaid);
    }

    function withdrawCapital(
        uint64 propertyId,
        uint256 amount
    ) external propertyExists(propertyId) onlyPropertyAdmin(propertyId) {
        require(amount > 0, "amount > 0");
        require(address(this).balance >= amount, "Insufficient treasury funds");

        (bool ok, ) = msg.sender.call{value: amount}("");
        require(ok, "Transfer failed");

        emit CapitalWithdrawn(propertyId, msg.sender, amount);
    }

    function isKycVerified(address user) external view returns (bool) {
        return kycVerified[user];
    }

    function getProperty(
        uint64 propertyId
    ) external view returns (PropertyConfig memory) {
        require(properties[propertyId].exists, "Property not found");
        return properties[propertyId];
    }

    function changePropertyAdmin(
        uint64 propertyId,
        address newAdmin
    ) external propertyExists(propertyId) onlyPropertyAdmin(propertyId) {
        require(newAdmin != address(0), "zero address");
        properties[propertyId].admin = newAdmin;
    }

    function _update(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory values
    ) internal virtual override(ERC1155, ERC1155Supply) {
        super._update(from, to, ids, values);
    }

    receive() external payable {}
    fallback() external payable {}
}

// Deployed at Base-Sepolia: 0x374dd5303AeE5BC034D16509C50adc74f5768C18
