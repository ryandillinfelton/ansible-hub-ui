import * as React from 'react';
import './namespace-list.scss';

import { RouteComponentProps, Link } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { Pagination } from '@patternfly/react-core';

import { ParamHelper } from '../../utilities/param-helper';
import { BaseHeader, NamespaceCard, Toolbar } from '../../components';
import { NamespaceAPI, NamespaceListType } from '../../api';
import { Paths, formatPath } from '../../paths';

interface IState {
    namespaces: NamespaceListType[];
    itemCount: number;
    params: {
        name?: string;
        sort?: string;
        page?: number;
        page_size?: number;
    };
}

interface IProps extends RouteComponentProps {
    title: string;
    namespacePath: Paths;

    // TODO: when this is set to true, get the user's id/account/tennant/org or
    // whatever we use to associate users with namespaces and filter the
    // namespaces by that value
    // Don't know what the APIs will look like for this yet
    filterOwner?: boolean;
}

export class NamespaceList extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);
        this.state = {
            namespaces: undefined,
            itemCount: 0,
            params: ParamHelper.parseParamString(props.location.search),
        };
    }

    render() {
        const { namespaces, params, itemCount } = this.state;
        const { title, namespacePath } = this.props;
        if (!namespaces) {
            return null;
        }

        return (
            <React.Fragment>
                <BaseHeader title={title}>
                    <div className='toolbar'>
                        <Toolbar
                            params={params}
                            sortOptions={[{ title: 'Name', id: 'name' }]}
                            searchPlaceholder={'Search ' + title}
                            updateParams={p =>
                                this.updateParams(p, () =>
                                    this.loadNamespaces(),
                                )
                            }
                        />

                        <div>
                            <Pagination
                                itemCount={itemCount}
                                perPage={params.page_size || 50}
                                page={params.page || 1}
                                onSetPage={(_, p) =>
                                    this.updateParams(
                                        ParamHelper.setParam(params, 'page', p),
                                        () => this.loadNamespaces(),
                                    )
                                }
                                onPerPageSelect={(_, p) => {
                                    this.updateParams(
                                        {
                                            ...params,
                                            page: 1,
                                            page_size: p,
                                        },
                                        () => this.loadNamespaces(),
                                    );
                                }}
                            />
                        </div>
                    </div>
                </BaseHeader>
                <Main>
                    <Section className='card-layout'>
                        {namespaces.map((ns, i) => (
                            <div key={i} className='card-wrapper'>
                                <Link
                                    to={formatPath(namespacePath, {
                                        namespace: ns.name,
                                    })}
                                >
                                    <NamespaceCard
                                        key={i}
                                        {...ns}
                                    ></NamespaceCard>
                                </Link>
                            </div>
                        ))}
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    componentDidMount() {
        this.loadNamespaces();
    }

    private loadNamespaces() {
        NamespaceAPI.list(this.state.params).then(results => {
            this.setState({
                namespaces: results.data.data,
                itemCount: results.data.meta.count,
            });
        });
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin();
    }
}
