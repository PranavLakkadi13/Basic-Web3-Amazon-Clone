// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

/*
flow of the contract: 
List products
Buy products 
withdraw funds 

we have an owner because it is being hosted like a personal website

The Item Id start from 1
*/

error Damazon__NotOwner();
error Damazon__NotEnoughEthSent();
error Damazon__OutOfStock();
error Damazon__TransactionFailed();
error Damazon__InvalidItemId();

contract Damazon {
    string private i_name;
    address private immutable i_owner;
    uint256 internal itemCount;

    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock;
    }

    struct Order {
        uint256 time;
        Item item;
    }

    event Item_Listed(string indexed _name, uint256 indexed _cost, uint256 indexed _quantity);
    event Buy_Item(address indexed _buyer, uint256 indexed _orderCount, uint256 indexed _itemId);

    constructor(string memory name){
        i_name = name;
        i_owner = msg.sender;
        itemCount = 0;
    }

    modifier OnlyOwner() {
        if (msg.sender != i_owner) {
            revert Damazon__NotOwner();
        }
        _;
    }

    function List(
        uint256 _id, 
        string memory _name, 
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public OnlyOwner {
        Item memory item = Item(_id,_name,_category,_image,_cost,_rating,_stock);
        
        items[_id] = item;

        unchecked {
            ++itemCount;
        }
        
        emit Item_Listed(_name, _cost, _stock);
    }

    function Buy(uint256 _id) public payable {
        if (_id == 0) {
            revert Damazon__InvalidItemId();
        }
        
        if (
            _id >= itemCount) {
            revert Damazon__InvalidItemId();
        }

        Item memory item = items[_id];

        if (item.stock == 0) {
            revert Damazon__OutOfStock();
        }

        if (msg.value < item.cost) {
            revert Damazon__NotEnoughEthSent();
        }    

        unchecked {
            items[_id].stock = item.stock - 1;
        }

        Order memory order = Order(block.timestamp, item);

        unchecked {
            ++orderCount[msg.sender];
        }

        orders[msg.sender][orderCount[msg.sender]] = order;

        emit Buy_Item(msg.sender, orderCount[msg.sender], item.id);
    }

    function withdraw() external {
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        if (!success) {
            revert Damazon__TransactionFailed();
        }
    }

    function getName() public view returns(string memory) {
        return i_name;
    }

    function getOwner() public view returns(address) {
        return i_owner;
    }

}