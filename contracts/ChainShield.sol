// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ChainShield
/// @notice Minimal on-chain product registry used to detect counterfeit
///         goods. A product is only ever written once (at manufacturer
///         registration + admin approval); every field is then immutable.
///         Verification is a free read call, so a customer can check a
///         product's authenticity without paying any gas.
contract ChainShield {
    struct Product {
        string productName;
        string batchNumber;
        string manufacturerName;
        string category;
        uint256 mfgDate;   // unix timestamp
        uint256 expDate;   // unix timestamp
        address addedBy;   // which account wrote this record
        uint256 timestamp; // when it was written on-chain
        bool exists;
    }

    address public owner;
    mapping(bytes32 => Product) private products;
    mapping(bytes32 => uint256) public scanCount;

    uint256 public totalProducts;

    event ProductAdded(
        bytes32 indexed productId,
        string productName,
        address indexed addedBy,
        uint256 timestamp
    );
    event ProductScanned(bytes32 indexed productId, uint256 newScanCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "ChainShield: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Register a new product on-chain. Called once, right after
    ///         the admin approves the manufacturer's registration request.
    /// @param productId keccak256 hash (or any unique bytes32) identifying
    ///        the product — the same id that gets encoded into its QR code.
    function addProduct(
        bytes32 productId,
        string calldata productName,
        string calldata batchNumber,
        string calldata manufacturerName,
        string calldata category,
        uint256 mfgDate,
        uint256 expDate
    ) external onlyOwner {
        require(!products[productId].exists, "ChainShield: product already registered");

        products[productId] = Product({
            productName: productName,
            batchNumber: batchNumber,
            manufacturerName: manufacturerName,
            category: category,
            mfgDate: mfgDate,
            expDate: expDate,
            addedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        totalProducts += 1;
        emit ProductAdded(productId, productName, msg.sender, block.timestamp);
    }

    /// @notice Free (view) call — a customer's app uses this to verify a
    ///         scanned product without spending any gas.
    function getProduct(bytes32 productId)
        external
        view
        returns (
            bool exists,
            string memory productName,
            string memory batchNumber,
            string memory manufacturerName,
            string memory category,
            uint256 mfgDate,
            uint256 expDate,
            uint256 timestamp
        )
    {
        Product storage p = products[productId];
        return (
            p.exists,
            p.productName,
            p.batchNumber,
            p.manufacturerName,
            p.category,
            p.mfgDate,
            p.expDate,
            p.timestamp
        );
    }

    /// @notice Records that a product's QR was scanned. Kept as a real
    ///         transaction (not a view call) specifically so the count is
    ///         tamper-evident too — anyone bulk-scanning a cloned code from
    ///         multiple locations shows up as a suspiciously high count.
    function recordScan(bytes32 productId) external returns (uint256) {
        require(products[productId].exists, "ChainShield: unknown product");
        scanCount[productId] += 1;
        emit ProductScanned(productId, scanCount[productId]);
        return scanCount[productId];
    }
}
