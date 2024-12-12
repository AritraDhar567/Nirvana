
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CardTransactionRegistry {

    enum ShipmentStatus { IN_TRANSIT_WHOLESALER, IN_TRANSIT_RETAILER, DELIVERED ,WHOLESALER_RECEIVED }

    // Structure to hold card transaction details
    struct CardTransaction {
        string receiverAddressW;
        string receiverAddressR;  // Address of the receiver
        string date;             // Date of the transaction
        string receiverAddressM;         
            
        ShipmentStatus status;   // Status of the transaction
        bool exists;             // To check if the transaction exists
    }

    // Mapping to store card transaction details using card ID as the key
    mapping(string => CardTransaction) private cardTransactions;

    // Array to store all card IDs for tracking all transactions
    string[] private allCardIds;


    // Function to register a new card transaction
    function registerCardTransaction(
        string memory _cardId,
        string memory _receiverAddressW,
        string memory _receiverAddressR,
        string memory _date,
        string memory _receiverAddressM
        
    ) public {
        // Check if the transaction with the given card ID already exists
        require(!cardTransactions[_cardId].exists, "Transaction with this card ID already exists!");

        // Store transaction details
        cardTransactions[_cardId] = CardTransaction({
            receiverAddressW: _receiverAddressW,
            receiverAddressR: _receiverAddressR,
            date: _date,
            receiverAddressM: _receiverAddressM,
            
            status: ShipmentStatus.IN_TRANSIT_WHOLESALER,
            exists: true
        });

        // Add the card ID to the array of all transactions
        allCardIds.push(_cardId);

        
    }


    // Helper function to convert ShipmentStatus enum to string
    function shipmentStatusToString(ShipmentStatus status) internal pure returns (string memory) {
        if (status == ShipmentStatus.IN_TRANSIT_WHOLESALER) {
            return "IN_TRANSIT_WHOLESALER";
        } else if (status == ShipmentStatus.IN_TRANSIT_RETAILER) {
            return "IN_TRANSIT_RETAILER";
        } else if (status == ShipmentStatus.DELIVERED) {
            return "DELIVERED"; 
        } else if (status == ShipmentStatus.WHOLESALER_RECEIVED) {
            return "WHOLESALER_RECEIVED";       
        } else {
            return "invalid_status";
        }
    }

    // Function to retrieve all registered transactions
    function getAllTransactions() 
        public 
        view 
        returns (
            string[] memory cardIds,
            string[] memory receiverAddressesW,
            string[] memory receiverAddressesR,
            string[] memory dates,
            string[] memory receiverAddressM,
            
            string[] memory statuses
        ) 
    {
        uint len = allCardIds.length;

        // Initialize arrays to store the transaction details
        string[] memory _cardIds = new string[](len);
        string[] memory _receiverAddressesW = new string[](len);
        string[] memory _receiverAddressesR = new string[](len);
        string[] memory _dates = new string[](len);
        string[] memory _receiverAddressM = new string[](len);
       
        string[] memory _statuses = new string[](len);

        for (uint i = 0; i < len; i++) {
            string memory cardId = allCardIds[i];
            CardTransaction memory transaction = cardTransactions[cardId];

            _cardIds[i] = cardId;
            _receiverAddressesW[i] = transaction.receiverAddressW;
            _receiverAddressesR[i] = transaction.receiverAddressR;
            _dates[i] = transaction.date;
            _receiverAddressM[i] = transaction.receiverAddressM;
            
            _statuses[i] = shipmentStatusToString(transaction.status);  // Convert status to string
        }

        // Return the arrays
        return (_cardIds, _receiverAddressesW, _receiverAddressesR, _dates, _receiverAddressM, _statuses);
    }

    // Function to search for a transaction by multiple fields for wholesaler
    function searchCardTransactionW(
        string memory _cardId,
        string memory _date,
        string memory _receiverAddressW,
        string memory _receiverAddressR
        
    )
        public
       
    {    
        // Check if the transaction exists
        require(cardTransactions[_cardId].exists, "Transaction with this card ID does not exist!");

        // Retrieve the transaction
        CardTransaction storage transaction = cardTransactions[_cardId];  // Use 'storage' to modify the transaction

        // Check if all parameters match
        require(transaction.status == ShipmentStatus.WHOLESALER_RECEIVED ,"status should be wholesaler Received");
        require(
            keccak256(abi.encodePacked(transaction.date)) == keccak256(abi.encodePacked(_date)),
            "Date mismatch"
        );
       
        require(
            keccak256(abi.encodePacked(transaction.receiverAddressW)) == keccak256(abi.encodePacked(_receiverAddressW)),
            "wholesaler address mismatch"
        );
        require(
            keccak256(abi.encodePacked(transaction.receiverAddressR)) == keccak256(abi.encodePacked(_receiverAddressR)),
            "Receiver address mismatch"
        );
       

        // Update the transaction's status
        transaction.status = ShipmentStatus.IN_TRANSIT_RETAILER;

        
    }

    // Function to search for a transaction by multiple fields for wholesaler when receive
    function searchCardTransactionWR(
        string memory _cardId,
        string memory _date,
        
        string memory _receiverAddressW,
        string memory _receiverAddressR
      
    )
        public
       
    {    
        // Check if the transaction exists
        require(cardTransactions[_cardId].exists, "Transaction with this card ID does not exist!");

        // Retrieve the transaction 
        CardTransaction storage transaction = cardTransactions[_cardId];  // Use 'storage' to modify the transaction

        // Check if all parameters match
        require(transaction.status == ShipmentStatus.IN_TRANSIT_WHOLESALER ,"status should be in transit to wholesaler");
        require(
            keccak256(abi.encodePacked(transaction.date)) == keccak256(abi.encodePacked(_date)),
            "Date mismatch"
        );
     
        require(
            keccak256(abi.encodePacked(transaction.receiverAddressW)) == keccak256(abi.encodePacked(_receiverAddressW)),
            "wholesaler address mismatch"
        );
        require(
            keccak256(abi.encodePacked(transaction.receiverAddressR)) == keccak256(abi.encodePacked(_receiverAddressR)),
            "Receiver address mismatch"
        );
       

        // Update the transaction's status
        transaction.status = ShipmentStatus.WHOLESALER_RECEIVED;

        
    }

    // Function to search by multiple fields for retailer
    function searchCardTransactionR(
        string memory _cardId,
        string memory _date,
        
        string memory _receiverAddressW,
        string memory _receiverAddressR
       
    )
        public
       
    {    
        // Check if the transaction exists
        require(cardTransactions[_cardId].exists, "Transaction with this card ID does not exist!");

        // Retrieve the transaction
        CardTransaction storage transaction = cardTransactions[_cardId];  // Use 'storage' to modify the transaction

        // Check if all parameters match
        require(transaction.status == ShipmentStatus.IN_TRANSIT_RETAILER ,"status should be in transit to retailer");
        require(
            keccak256(abi.encodePacked(transaction.date)) == keccak256(abi.encodePacked(_date)),
            "Date mismatch"
        );
     
         require(
            keccak256(abi.encodePacked(transaction.receiverAddressW)) == keccak256(abi.encodePacked(_receiverAddressW)),
            "wholesaler address mismatch"
        );
        require(
            keccak256(abi.encodePacked(transaction.receiverAddressR)) == keccak256(abi.encodePacked(_receiverAddressR)),
            "Receiver address mismatch"
        );
      

        // Update the transaction's status
        transaction.status = ShipmentStatus.DELIVERED;

       

       
    }
}