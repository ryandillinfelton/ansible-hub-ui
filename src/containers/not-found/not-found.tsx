import * as React from 'react';
import './not-found.scss';
import RageTater from '../../../static/images/awx-spud.gif';

import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Main, Section } from '@redhat-cloud-services/frontend-components';
import { Bullseye } from '@patternfly/react-core';

import { BaseHeader, NotImplemented } from '../../components';

class NotFound extends React.Component<RouteComponentProps, {}> {
    render() {
        return (
            <React.Fragment>
                <BaseHeader title='404 - Page Not Found'></BaseHeader>
                <Main>
                    <Section className='body'>
                        <Bullseye className='bullseye'>
                            <div className='bullseye-center'>
                                <img src={RageTater} alt='AWX Spud' />
                                <div>
                                    We couldn't find the page you're looking
                                    for!
                                </div>
                                <div className='pf-c-content'>
                                    <span className='four-oh-four'>404</span>
                                </div>
                            </div>
                        </Bullseye>
                    </Section>
                </Main>
            </React.Fragment>
        );
    }
}

export default withRouter(NotFound);
