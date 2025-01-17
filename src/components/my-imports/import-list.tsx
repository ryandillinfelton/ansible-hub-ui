import * as React from 'react';
import './my-imports.scss';

import * as moment from 'moment';
import { cloneDeep } from 'lodash';

import {
    EmptyState,
    EmptyStateIcon,
    EmptyStateBody,
    Title,
    TextInput,
    Pagination,
    FormSelect,
    FormSelectOption,
} from '@patternfly/react-core';
import { InfoIcon } from '@patternfly/react-icons';
import { Spinner } from '@redhat-cloud-services/frontend-components';

import { PulpStatus, NamespaceType, ImportListType } from '../../api';
import { ParamHelper } from '../../utilities/param-helper';
import { Constants } from '../../constants';

interface IProps {
    namespaces: NamespaceType[];
    importList: ImportListType[];
    selectedImport: ImportListType;
    noImportsExist: boolean;
    numberOfResults: number;
    params: {
        page_size?: number;
        page?: number;
        keyword?: string;
        namespace?: string;
    };

    selectImport: (x) => void;
    updateParams: (filters) => void;
}

interface IState {
    kwField: string;
}

export class ImportList extends React.Component<IProps, IState> {
    constructor(props) {
        super(props);

        this.state = {
            kwField: '',
        };
    }

    render() {
        const {
            selectImport,
            importList,
            selectedImport,
            namespaces,
            noImportsExist,
            numberOfResults,
            params,
            updateParams,
        } = this.props;

        const { kwField } = this.state;

        const pageNumber = Number(params.page) || 1;
        const pageSize = Number(params.page_size) || 10;

        return (
            <div className='import-list'>
                {this.renderNamespacePicker(namespaces)}
                <TextInput
                    value={kwField}
                    onChange={k => this.setState({ kwField: k })}
                    onKeyPress={e => this.handleEnter(e)}
                    type='search'
                    aria-label='search text input'
                    placeholder='Find Import'
                    className='search-box'
                />
                <div>
                    {this.renderList(
                        selectImport,
                        importList,
                        selectedImport,
                        noImportsExist,
                    )}
                </div>
                <Pagination
                    itemCount={numberOfResults}
                    perPage={params.page_size || Constants.DEFAULT_PAGE_SIZE}
                    page={params.page || 1}
                    onSetPage={(_, p) =>
                        updateParams(ParamHelper.setParam(params, 'page', p))
                    }
                    onPerPageSelect={(_, p) => {
                        updateParams({ ...params, page: 1, page_size: p });
                    }}
                />
            </div>
        );
    }

    private setPageSize(size) {
        const params = cloneDeep(this.props.params);

        params['page_size'] = size;
        params['page'] = 1;
        this.props.updateParams(params);
    }

    private setPageNumber(pageNum) {
        const params = cloneDeep(this.props.params);
        params['page'] = pageNum;
        this.props.updateParams(params);
    }

    private renderList(
        selectImport,
        importList,
        selectedImport,
        noImportsExist,
    ) {
        if (noImportsExist) {
            return (
                <EmptyState>
                    <EmptyStateIcon icon={InfoIcon} />
                    <Title size='lg' headingLevel='h5'>
                        No Imports
                    </Title>

                    <EmptyStateBody>
                        There have not been any imports on this namespace
                    </EmptyStateBody>
                </EmptyState>
            );
        }

        if (!importList) {
            return (
                <div className='loading'>
                    <Spinner centered={true} />
                </div>
            );
        }

        return (
            <div>
                {importList.map(item => {
                    return (
                        <div
                            onClick={() => selectImport(item)}
                            key={item.id}
                            className={
                                item.type === selectedImport.type &&
                                item.id === selectedImport.id
                                    ? 'clickable list-container selected-item'
                                    : 'clickable list-container'
                            }
                        >
                            <div className='left'>
                                <i
                                    className={this.getStatusClass(item.state)}
                                />
                            </div>
                            <div className='right'>
                                {this.renderDescription(item)}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    private handleEnter(e) {
        if (e.key === 'Enter') {
            this.props.updateParams(
                ParamHelper.setParam(
                    this.props.params,
                    'keywords',
                    this.state.kwField,
                ),
            );
        }
    }

    private renderDescription(item) {
        return (
            <div>
                <div>
                    {item.name} {item.version ? 'v' + item.version : ''}
                </div>
                <div className='sub-text'>
                    Status: {item.state}{' '}
                    {item.finished_at
                        ? moment(item.finished_at).fromNow()
                        : null}
                </div>
            </div>
        );
    }

    private getStatusClass(state) {
        const statusClass = 'fa status-icon ';

        switch (state) {
            case PulpStatus.running:
                return statusClass + 'fa-spin fa-spinner warning';
            case PulpStatus.waiting:
                return statusClass + 'fa-spin fa-spinner warning';
            case PulpStatus.completed:
                return statusClass + 'fa-circle success';
            default:
                return statusClass + 'fa-circle failed';
        }
    }

    private renderNamespacePicker(namespaces) {
        return (
            <div className='namespace-selector-wrapper'>
                <div className='label'>Namespace</div>
                <div className='selector'>
                    <FormSelect
                        onChange={val =>
                            this.props.updateParams(
                                ParamHelper.setParam(
                                    this.props.params,
                                    'namespace',
                                    val,
                                ),
                            )
                        }
                        value={this.props.params.namespace}
                        aria-label='Select namespace'
                    >
                        {namespaces.map(ns => (
                            <FormSelectOption
                                key={ns.name}
                                label={ns.name}
                                value={ns.name}
                            />
                        ))}
                    </FormSelect>
                </div>
            </div>
        );
    }
}
