import * as React from 'react';
import './my-imports.scss';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { Button } from '@patternfly/react-core';
import { cloneDeep } from 'lodash';

import { BaseHeader, ImportConsole, ImportList } from '../../components';

import {
    ImportAPI,
    ImportDetailType,
    ImportListType,
    NamespaceAPI,
    NamespaceType,
    PulpStatus,
} from '../../api';

import { ParamHelper } from '../../utilities/param-helper';

interface IState {
    selectedImport: ImportListType;
    importList: ImportListType[];
    selectedImportDetails: ImportDetailType;
    params: {
        page_size?: number;
        page?: number;
        keyword?: string;
        namespace?: string;
    };
    namespaces: NamespaceType[];
    resultsCount: number;
    noImportsExist: boolean;
    importDetailError: string;
    followLogs: boolean;
}

class MyImports extends React.Component<RouteComponentProps, IState> {
    polling: any;
    topOfPage: any;

    constructor(props) {
        super(props);

        const params = ParamHelper.parseParamString(props.location.search, [
            'page',
            'page_size',
        ]);

        this.topOfPage = React.createRef();

        this.state = {
            selectedImport: undefined,
            importList: [],
            params: params,
            namespaces: [],
            selectedImportDetails: undefined,
            resultsCount: 0,
            noImportsExist: false,
            importDetailError: '',
            followLogs: false,
        };
    }

    componentDidMount() {
        // Load namespaces, use the namespaces to query the import list,
        // use the import list to load the task details
        this.loadNamespaces(() =>
            this.loadImportList(() => this.loadTaskDetails()),
        );

        this.polling = setInterval(() => {
            if (
                this.state.selectedImportDetails.state === PulpStatus.running ||
                this.state.selectedImportDetails.state === PulpStatus.waiting
            ) {
                this.poll();
            }
        }, 2000);
    }

    componentWillUnmount() {
        clearInterval(this.polling);
    }

    render() {
        const {
            selectedImport,
            importList,
            params,
            namespaces,
            selectedImportDetails,
            resultsCount,
            noImportsExist,
            importDetailError,
            followLogs,
        } = this.state;

        if (!importList) {
            return null;
        }

        return (
            <React.Fragment>
                <div ref={this.topOfPage}></div>
                <BaseHeader title='My Imports' />
                <Main>
                    <Section className='body'>
                        <div className='page-container'>
                            <div className='import-list'>
                                <ImportList
                                    importList={importList}
                                    selectedImport={selectedImport}
                                    noImportsExist={noImportsExist}
                                    numberOfResults={resultsCount}
                                    params={params}
                                    namespaces={namespaces}
                                    selectImport={sImport =>
                                        this.selectImport(sImport)
                                    }
                                    updateParams={params => {
                                        this.updateParams(params, () =>
                                            this.loadImportList(),
                                        );
                                    }}
                                />
                            </div>

                            <div className='import-console'>
                                <ImportConsole
                                    task={selectedImportDetails}
                                    followMessages={followLogs}
                                    setFollowMessages={isFollowing => {
                                        this.setState({
                                            followLogs: isFollowing,
                                        });
                                    }}
                                    selectedImport={selectedImport}
                                    apiError={importDetailError}
                                />
                            </div>
                        </div>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }

    private get updateParams() {
        return ParamHelper.updateParamsMixin();
    }

    private selectImport(sImport) {
        this.setState({ selectedImport: sImport }, () => {
            this.topOfPage.current.scrollIntoView({
                behavior: 'smooth',
            });
            this.loadTaskDetails();
        });
    }

    private poll() {
        this.loadTaskDetails(() => {
            // Update the state of the selected import in the list if it's
            // different from the one loaded from the API.
            const {
                selectedImport,
                selectedImportDetails,
                importList,
            } = this.state;

            if (!selectedImportDetails) {
                return;
            }

            if (selectedImport.state !== selectedImportDetails.state) {
                const importIndex = importList.findIndex(
                    x => x.id === selectedImport.id,
                );

                const imports = cloneDeep(importList);
                const newSelectedImport = cloneDeep(selectedImport);

                newSelectedImport.state = selectedImportDetails.state;
                newSelectedImport.finished_at =
                    selectedImportDetails.finished_at;

                imports[importIndex] = newSelectedImport;

                this.setState({
                    selectedImport: newSelectedImport,
                    importList: imports,
                });
            }
        });
    }

    private loadNamespaces(callback?: () => void) {
        // TODO: filter by namespaces by current user
        NamespaceAPI.list()
            .then(result => {
                const namespaces = result.data.data;
                let selectedNS;

                if (this.state.params.namespace) {
                    selectedNS = namespaces.find(
                        x => x.id === this.state.params.namespace,
                    );
                }

                if (!selectedNS) {
                    selectedNS = namespaces[0];
                }

                this.setState(
                    {
                        namespaces: namespaces,
                        params: {
                            ...this.state.params,
                            namespace: selectedNS.name,
                        },
                    },
                    callback,
                );
            })
            .catch(result => console.log(result));
    }

    private loadImportList(callback?: () => void) {
        ImportAPI.list(this.state.params)
            .then(importList => {
                this.setState(
                    {
                        importList: importList.data.data,
                        selectedImport: importList.data.data[0],
                        resultsCount: importList.data.meta.count,
                    },
                    callback,
                );
            })
            .catch(result => console.log(result));
    }

    private loadTaskDetails(callback?: () => void) {
        if (!this.state.selectedImport) {
            this.setState({
                importDetailError: 'No Data',
                noImportsExist: true,
            });
        } else {
            ImportAPI.get(this.state.selectedImport.id)
                .then(result => {
                    this.setState(
                        {
                            importDetailError: '',
                            noImportsExist: false,
                            selectedImportDetails: result.data,
                        },
                        callback,
                    );
                })
                .catch(result => {
                    this.setState({
                        selectedImportDetails: undefined,
                        importDetailError: 'Error fetching import from API',
                    });
                });
        }
    }
}

export default withRouter(MyImports);
