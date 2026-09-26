import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';

function TicketList() {

    const navigate = useNavigate();

    const [requests, setRequests] = useState([]);

    const username = localStorage.getItem('username');

    const role = Number(
        localStorage.getItem('role')
    );

    const getRequests = async () => {

        try {

            const response = await api.get(
                '/tickets',
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            setRequests(response.data);

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                'Unable to load requests'
            );

        }
    };

    useEffect(() => {

        getRequests();

    }, []);

    const deleteRequest = async (id) => {

        if (
            !window.confirm(
                'Are you sure you want to delete this request?'
            )
        ) {
            return;
        }

        try {

            await api.delete(
                `/tickets/${id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            getRequests();

        } catch (error) {

            alert(
                error.response?.data?.detail ||
                'Unable to delete request'
            );

        }
    };

    return (

        <div className="portal-page">

            <div className="content-container">

                {/* PAGE HEADER */}

                <div className="page-header">

                    <div>

                        <h1>
                            HR Service Requests
                        </h1>

                        <div className="welcome-text">
                            Welcome, {username}
                        </div>

                    </div>

                    <button
                        className="new-request-button"
                        onClick={() =>
                            navigate('/requests/new')
                        }
                    >
                        New Request
                    </button>

                </div>


                {/* REQUEST TABLE */}

                <div className="request-card">

                    <table className="request-table">

                        <thead>

                            <tr>

                                <th>
                                    Title
                                </th>

                                <th>
                                    Description
                                </th>

                                <th>
                                    Category
                                </th>

                                <th>
                                    Status
                                </th>

                                <th>
                                    Actions
                                </th>

                            </tr>

                        </thead>


                        <tbody>

                            {requests.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="empty-message"
                                    >
                                        No HR service requests found
                                    </td>

                                </tr>

                            ) : (

                                requests.map((request) => (

                                    <tr key={request.id}>

                                        {/* TITLE */}

                                        <td className="title-cell">
                                            {request.title}
                                        </td>


                                        {/* DESCRIPTION */}

                                        <td>
                                            {request.description}
                                        </td>


                                        {/* CATEGORY */}

                                        <td>
                                            {request.category}
                                        </td>


                                        {/* STATUS */}

                                        <td>

                                            <span
                                                className={
                                                    `status-badge ${
                                                        request.status
                                                            .toLowerCase()
                                                            .replace('_', '-')
                                                    }`
                                                }
                                            >
                                                {request.status}
                                            </span>

                                        </td>


                                        {/* ACTIONS */}

                                        <td>

                                            {/* 
                                                ROLE 2 = HR
                                                ROLE 3 = TEAM LEAD
                                                ROLE 4 = ADMIN

                                                These roles can edit.
                                            */}

                                            {(role === 2 ||
                                                role === 3 ||
                                                role === 4) && (

                                                <button
                                                    className="edit-button"
                                                    onClick={() =>
                                                        navigate(
                                                            `/requests/edit/${request.id}`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>

                                            )}


                                            {/* 
                                                ROLE 4 = ADMIN

                                                Only Admin can delete.
                                            */}

                                            {role === 4 && (

                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        deleteRequest(
                                                            request.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            )}

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );
}

export default TicketList;