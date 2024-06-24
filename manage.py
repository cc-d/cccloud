#!/usr/bin/env python3
import os.path as op
import argparse as ap
import sys
import os
import base58 as b58
import json
import typing as T
from hashlib import sha256
from uuid import uuid4


class User:
    uuid: T.Optional[str]
    cccid: str
    secret: str

    def __init__(
        self,
        uuid: T.Optional[str] = None,
        cccid: T.Optional[str] = None,
        secret: T.Optional[str] = None,
    ):
        if uuid is None:
            if cccid is None and secret is None:
                self.uuid = str(uuid4())
                h = sha256(self.uuid.encode()).digest()
                self.ccicd = b58.b58encode(h[0:16])
                self.secret = b58.b58encode(h[16:32])
            else:
                raise ValueError('cccid and secret must be provided together')
        elif cccid is not None and secret is not None:
            self.uuid = uuid
            self.cccid = cccid
            self.secret = secret
        else:
            raise ValueError('cccid and secret must be provided together')

    def __init__(
        self, path=op.join(op.abspath(op.dirname(__file__)), 'users.json')
    ):
        self.path = path
        self.users = self.load_users()


def main(*args, **kwargs):
    parser = ap.ArgumentParser(description='Manage cccloud')
    cmd = parser.add_subparsers(
        title='commands',
        dest='cmd',
        help='commands',
        metavar='cmd',
        required=True,
    )
    user = cmd.add_parser('user', help='user commands')
    user_act = user.add_subparsers(
        title='actions',
        dest='action',
        help='actions',
        metavar='action',
        required=True,
    )
    user_add = user_act.add_parser('add', help='add a user')


if __name__ == '__main__':
    main(sys.argv[1:])
