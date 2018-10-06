pragma solidity ^0.4.24;

contract SimpleStorage {
  string ipfHash;

  function set(string x) public {
    ipfHash = x;
  }

  function get() public view returns (string) {
    return ipfHash;
  }
}
