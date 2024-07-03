#!/usr/bin/env python3
import os.path as op
import argparse as ap
import sys
import os
import base58 as b58
import json
import typing as T
from pyshared import default_repr, truncstr
from hashlib import sha256
from uuid import uuid4, UUID


class User:
    uuid: str
    cccid: str
    secret: str

    def __init__(
        self,
        uuid: str,
        cccid: T.Optional[str] = None,
        secret: T.Optional[str] = None,
    ):
        self._uuid = UUID(uuid)
        self.uuid = str(self._uuid)

        if cccid is None and secret is None:
            h = sha256(self.uuid.encode()).digest()
            self.cccid = b58.b58encode(h[0:16]).decode()
            self.secret = b58.b58encode(h[16:32]).decode()
        else:
            self.cccid, self.secret = cccid, secret

    def json(self, as_str: bool = False) -> T.Union[str, dict]:
        if as_str:
            return json.dumps(
                {self.uuid: {'cccid': self.cccid, 'secret': self.secret}}
            )
        return {self.uuid: {'cccid': self.cccid, 'secret': self.secret}}

    def __repr__(self):
        return default_repr(self)

    __str__ = __repr__


class Users:
    users: dict

    def __init__(self, path: str):
        self.path = path
        self.users = self._load_file()

    def _load_file(self) -> dict:
        with open(self.path, 'r') as f:
            return json.load(f)

    def add(self, user: T.Optional[User] = None):
        if user is not None:
            self.users[user.uuid] = user
        else:
            user = User(str(uuid4()))
            self.users[user.uuid] = {
                'cccid': user.cccid,
                'secret': user.secret,
            }
        os.mkdir(
            op.join(op.abspath(op.dirname(__file__)), 'uploads', user.cccid)
        )
        self._save_file()

    def list(self, secret: bool = False):
        for uid, uvals in self.users.items():
            sec = (
                uvals['secret']
                if secret
                else truncstr(uvals['secret'], start_chars=1)
            )
            print(f'User: {uid} {uvals["cccid"]} {sec}')

    def _save_file(self):
        with open(self.path, 'w') as f:
            json.dump(self.users, f)

    def __repr__(self):
        return default_repr(self)

    __str__ = __repr__


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
    luser = useract.add_parser('l', aliases=['list'], help='list users')
    luser.add_argument(
        '-s', '--secret', action='store_true', help='show user secrets'
    )
    nspace = parser.parse_args(*args, **kwargs)

    users = Users(op.join(op.abspath(op.dirname(__file__)), 'users.json'))

    if nspace.cmd == 'user':
        if nspace.action is None:
            parser.print_help()
        elif nspace.action.startswith('a'):
            users.add()
        elif nspace.action.startswith('l'):
            users.list(nspace.secret)


if __name__ == '__main__':
    main(sys.argv[1:])
