pragma solidity 0.8.20;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IPositionRouter} from "./interfaces/GMXPositionRouter.sol";
import {IRouter} from "./interfaces/GMXRouter.sol";
import "hardhat/console.sol";
contract Account {
    address immutable USDC;
    address immutable GMX_POSITION_ROUTER;
    address immutable GMX_ROUTER;

    constructor(address _usdc, address _gmxPositionRouter, address _gmxRouter) {
        USDC = _usdc;
        GMX_POSITION_ROUTER = _gmxPositionRouter;
        GMX_ROUTER = _gmxRouter;
    }

    mapping(address => uint256) userDeposit;
    uint256 usedMargin;

    // todo non reantrance
    function Deposit(uint256 amount) external {

                IERC20(USDC).transferFrom(msg.sender,address(this) ,amount);
        userDeposit[msg.sender] += amount;
    }

    function withdrawal(uint256 amount) external {
        require(
          (  userDeposit[msg.sender] - usedMargin) >= amount,
            "not enough fudn to withraw"
        );
        IERC20(USDC).transfer(msg.sender, amount);
        userDeposit[msg.sender] -= amount;
    }
    function approvePlugin()external {
        IRouter(GMX_ROUTER).approvePlugin(GMX_POSITION_ROUTER);
    }
     
    function createPosition(
        address[] memory _path,
        address _indexToken,
        uint256 _amountIn,
        uint256 _minOut,
        uint256 _sizeDelta,
        bool _isLong,
        uint256 _acceptablePrice,
        uint256 _executionFee,
        bytes32 _referralCode
    ) external payable {
        // console.log("paht",_amountIn);
        console.log("Hello form inside");
        //  load GMX position router
        require(msg.value >= _executionFee, "Insufficient Ether sent");
    IERC20(USDC).approve(GMX_ROUTER, 10 ether);
 (bool success, ) = address(GMX_POSITION_ROUTER).call{value: _executionFee}(
        abi.encodeWithSignature(
            "createIncreasePosition(address[],address,uint256,uint256,uint256,bool,uint256,uint256,bytes32,address)",
            _path,
            _indexToken,
            _amountIn,
            _minOut,
            _sizeDelta,
            _isLong,
            _acceptablePrice,
            _executionFee,
            _referralCode,
            0x0000000000000000000000000000000000000000
        )
    );
        // IPositionRouter(GMX_POSITION_ROUTER).createIncreasePosition(
        //     _path,
        //     _indexToken,
        //     _amountIn,
        //     _minOut,
        //     _sizeDelta,
        //     _isLong,
        //     _acceptablePrice,
        //     _executionFee,
        //     _referralCode,
        //     0x0000000000000000000000000000000000000000
        // );
          require(success, "createIncreasePosition call failed");
        usedMargin += _amountIn;
    }
}
