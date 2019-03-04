pragma solidity ^0.4.24;

contract claimHub {
    mapping(string => Claim) claims;

    struct Claim{
        string owner;
        string claimContent;
    }

    function setClaim(string _owner, string _claimContent) public {
        claims[_owner].owner = _owner;
        claims[_owner].claimContent = _claimContent;
    }

    function getClaim(string _owner) public view returns (string) {
        return claims[_owner].claimContent;
    }

}
