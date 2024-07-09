#!/usr/bin/env python3
import os.path as op
import argparse as ap
import sys
import os
import base58 as b58
import json
import typing as T
from os import urandom
from hashlib import sha256, _Hash
from pyshared import default_repr, truncstr
from hashlib import sha256
from utils import HashSecret


def main(*args, **kwargs):
    parser = ap.ArgumentParser(description='Manage cccloud')

    pcmd = parser.add_subparsers(
        title='cmd', description='commands', dest='cmd', required=True
    )

    puser = pcmd.add_parser('user', help='manage users')
    useract = puser.add_subparsers(
        title='action', description='user actions', dest='action'
    )

    auser = useract.add_parser('a', aliases=['add'], help='add a user')

    nspace = parser.parse_args(*args, **kwargs)

    if nspace.cmd == 'user':
        

if __name__ == '__main__':
    main(sys.argv[1:])
